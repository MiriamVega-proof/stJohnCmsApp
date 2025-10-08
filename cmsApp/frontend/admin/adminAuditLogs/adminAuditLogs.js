// adminAuditLogs.js

// Import Firebase components (Keeping them for structure)
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Global variables for state management
let currentPage = 1;
const logsPerPage = 10;
let allLogs = [];
let filteredLogs = [];
let totalPages = 1;

// Firebase variables (required even if mock data is used)
let db;
let auth;
let userId = null;
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

// DOM elements
const logTableBody = document.getElementById('logTableBody');
const noLogsMessage = document.getElementById('noLogsMessage');
const prevPageBtn = document.getElementById('prevPageBtn');
const nextPageBtn = document.getElementById('nextPageBtn');
const pageInfo = document.getElementById('pageInfo');
const logSearch = document.getElementById('logSearch');
const clearSearchBtn = document.getElementById('clearSearchBtn');
const moduleFilter = document.getElementById('moduleFilter');
const actionTypeFilter = document.getElementById('actionTypeFilter');
const startDateFilter = document.getElementById('startDateFilter');
const endDateFilter = document.getElementById('endDateFilter');

// Logout elements (fetched from the DOM) - Retaining for clarity, though not strictly needed with querySelectorAll
const logoutLinkDesktop = document.getElementById('logoutLinkDesktop');
const logoutLinkMobile = document.getElementById('logoutLinkMobile'); 

// --- MOCK DATA ---
const mockLogs = [
    { id: 'L-001', userId: 'usr-101', userName: 'Admin User', module: 'Users', actionType: 'CREATE', description: 'Created new Secretary account: Jane Doe', timestamp: new Date(Date.now() - 3600000) },
    { id: 'L-002', userId: 'usr-102', userName: 'Secretary Jane', module: 'Reservations', actionType: 'UPDATE', description: 'Lot A-10 reservation status updated to Confirmed', timestamp: new Date(Date.now() - 1800000) },
    { id: 'L-003', userId: 'usr-101', userName: 'Admin User', module: 'Payments', actionType: 'PAYMENT', description: 'Recorded P25,000 successful payment for Lot A-10', timestamp: new Date(Date.now() - 600000) },
    { id: 'L-004', userId: 'usr-103', userName: 'Client Mark', module: 'System', actionType: 'LOGIN', description: 'Successful client login to the portal', timestamp: new Date(Date.now() - 300000) },
    { id: 'L-005', userId: 'usr-104', userName: 'Client Lisa', module: 'Reservations', actionType: 'CREATE', description: 'Submitted new lot reservation request for Lot B-5', timestamp: new Date(Date.now() - 120000) },
    { id: 'L-006', userId: 'usr-101', userName: 'Admin User', module: 'Burials', actionType: 'DELETE', description: 'Permanently deleted burial record: John Smith', timestamp: new Date(Date.now() - 60000) },
    { id: 'L-007', userId: 'usr-102', userName: 'Secretary Jane', module: 'Appointments', actionType: 'UPDATE', description: 'Rescheduled appointment #88 from 10am to 11am', timestamp: new Date(Date.now() - 10000) },
    { id: 'L-008', userId: 'usr-101', userName: 'Admin User', module: 'Users', actionType: 'UPDATE', description: 'Changed user role for usr-106 to Secretary', timestamp: new Date(Date.now() - 5000) },
    { id: 'L-009', userId: 'usr-103', userName: 'Client Mark', module: 'System', actionType: 'LOGIN', description: 'Failed login attempt (Incorrect Password)', timestamp: new Date(Date.now() - 2000) },
    { id: 'L-010', userId: 'usr-101', userName: 'Admin User', module: 'Payments', actionType: 'CREATE', description: 'Registered new payment plan for client ID 112', timestamp: new Date(Date.now() - 1000) },
    { id: 'L-011', userId: 'usr-105', userName: 'Secretary Jane Doe', module: 'Appointments', actionType: 'CREATE', description: 'Created new burial appointment for Lot D-1', timestamp: new Date(Date.now() - 500) },
    { id: 'L-012', userId: 'usr-102', userName: 'Secretary Jane', module: 'Reservations', actionType: 'DELETE', description: 'Cancelled reservation for Lot B-5', timestamp: new Date(Date.now() - 100) },
    { id: 'L-013', userId: 'usr-101', userName: 'Admin User', module: 'Users', actionType: 'CREATE', description: 'Added new maintenance staff user', timestamp: new Date(Date.now() - 7000000) },
    { id: 'L-014', userId: 'usr-103', userName: 'Client Mark', module: 'System', actionType: 'LOGIN', description: 'Successful client login to the portal', timestamp: new Date(Date.now() - 8000000) },
    { id: 'L-015', userId: 'usr-108', userName: 'Maintenance Bob', module: 'Maintenance', actionType: 'UPDATE', description: 'Completed maintenance task: Cleanup Section C', timestamp: new Date(Date.now() - 9000000) },
    { id: 'L-016', userId: 'usr-108', userName: 'Maintenance Bob', module: 'Maintenance', actionType: 'CREATE', description: 'Reported damage to Lot E-20 headstone', timestamp: new Date(Date.now() - 10000000) },
    { id: 'L-017', userId: 'usr-101', userName: 'Admin User', module: 'Financials', actionType: 'CREATE', description: 'Approved Q3 budget for groundskeeping', timestamp: new Date(Date.now() - 11000000) },
    { id: 'L-018', userId: 'usr-101', userName: 'Admin User', module: 'System', actionType: 'UPDATE', description: 'Updated system security configuration policies', timestamp: new Date(Date.now() - 12000000) },
    { id: 'L-019', userId: 'usr-101', userName: 'Admin User', module: 'CemeteryMap', actionType: 'UPDATE', description: 'Updated Lot B-15 status to Occupied and marked on map', timestamp: new Date(Date.now() - 50) },
];
allLogs = mockLogs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()); 
filteredLogs = [...allLogs];
// --- END MOCK DATA ---

// Initialize Firebase and Authentication (Minimal implementation)
const setupFirebase = async () => {
    try {
        const app = initializeApp(firebaseConfig);
        db = getFirestore(app);
        auth = getAuth(app);
        
        if (initialAuthToken) {
            await signInWithCustomToken(auth, initialAuthToken);
        } else {
            await signInAnonymously(auth);
        }

        onAuthStateChanged(auth, (user) => {
            userId = user ? user.uid : null;
            filterLogs(); 
        });
    } catch (error) {
        console.error("Error setting up Firebase:", error);
        filterLogs(); 
    }
};


 
const handleLogout = async (e) => {
    e.preventDefault(); // Stop the link from navigating immediately
    
    // 1. Confirmation Alert (Added back in for safety)
    if (!confirm("Are you sure you want to log out?")) {
        return; 
    }

    // 2. Attempt Firebase Sign Out
    try {
        if (auth && auth.currentUser) {
            await signOut(auth);
            console.log("User signed out successfully.");
        }
    } catch (error) {
        console.error("Error during Firebase sign out:", error);
    }
    
    // 3. Redirect using the link's href attribute
    const clickedLink = e.currentTarget;
    const redirectPath = clickedLink.getAttribute('href');
    
    // Fallback/Check (Optional, but good practice if href could be '#')
    if (redirectPath && redirectPath !== '#') {
        window.location.href = redirectPath; 
    } else {
        // Fallback to a known path if the href attribute is missing or '#'
        window.location.href = '../../../frontend/auth/login/login.html';
    }
};

// --- Core Rendering and Pagination Logic ---

const formatTimestamp = (date) => {
    return new Date(date).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit', second: '2-digit'
    });
};

const getActionBadgeClass = (actionType) => {
    switch (actionType) {
        case 'CREATE': return 'type-create';
        case 'UPDATE': return 'type-update';
        case 'DELETE': return 'type-delete';
        case 'LOGIN': return 'type-login';
        case 'PAYMENT': return 'type-payment';
        default: return '';
    }
};

const renderLogs = (page) => {
    logTableBody.innerHTML = '';
    currentPage = page;
    const startIndex = (currentPage - 1) * logsPerPage;
    const logsToRender = filteredLogs.slice(startIndex, startIndex + logsPerPage);
    totalPages = Math.max(1, Math.ceil(filteredLogs.length / logsPerPage));

    if (currentPage > totalPages && totalPages > 0) {
          currentPage = totalPages;
          renderLogs(currentPage);
          return;
    }

    if (logsToRender.length === 0) {
        noLogsMessage.classList.remove('d-none');
    } else {
        noLogsMessage.classList.add('d-none');
        logsToRender.forEach((log) => {
            const row = document.createElement('tr');
            const badgeClass = getActionBadgeClass(log.actionType); 
            row.innerHTML = `
                <td>${formatTimestamp(log.timestamp)}</td>
                <td><span class="user-id-text">${log.userId}</span></td>
                <td>${log.userName}</td>
                <td><span class="module-text">${log.module}</span></td>
                <td><span class="log-type-badge ${badgeClass}">${log.actionType}</span></td>
                <td>${log.description}</td>
            `;
            logTableBody.appendChild(row);
        });
    }

    pageInfo.textContent = `Page ${currentPage} of ${totalPages}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage >= totalPages;
};

window.filterLogs = () => { 
    const searchText = logSearch.value.toLowerCase();
    const selectedModule = moduleFilter.value;
    const selectedAction = actionTypeFilter.value;
    const startDateVal = startDateFilter.value;
    const endDateVal = endDateFilter.value;

    const startDate = startDateVal ? new Date(startDateVal).setHours(0, 0, 0, 0) : 0;
    const endDate = endDateVal ? new Date(endDateVal).setHours(23, 59, 59, 999) : Infinity;

    filteredLogs = allLogs.filter(log => {
        const logTimestamp = log.timestamp.getTime();
        if (logTimestamp < startDate || logTimestamp > endDate) return false;
        if (searchText && 
            !log.userId.toLowerCase().includes(searchText) && 
            !log.userName.toLowerCase().includes(searchText) && 
            !log.description.toLowerCase().includes(searchText)) return false;
        if (selectedModule !== 'All' && log.module !== selectedModule) return false;
        if (selectedAction !== 'All' && log.actionType !== selectedAction) return false;
        return true;
    });

    currentPage = 1;
    renderLogs(currentPage);
    clearSearchBtn.classList.toggle('d-none', !searchText);
};

window.clearSearch = () => {
    logSearch.value = '';
    filterLogs();
};

// --- NEW CLEAR FILTERS FUNCTION ---
window.clearFilters = () => {
    logSearch.value = '';
    moduleFilter.value = 'All';
    actionTypeFilter.value = 'All';
    startDateFilter.value = '';
    endDateFilter.value = '';
    filterLogs(); // Re-apply filters to refresh the table
};
// ---------------------------------

window.changePage = (direction) => { 
    const newPage = currentPage + direction;
    if (newPage >= 1 && newPage <= totalPages) {
        renderLogs(newPage);
    }
};

// --- Event Listeners and Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    
    
    const logoutLinks = document.querySelectorAll('#logoutLinkDesktop, #logoutLinkMobile');
    
    // Attach the single, robust handler to both the desktop and mobile elements
    logoutLinks.forEach(link => {
        if (link) {
            link.addEventListener('click', handleLogout);
        }
    });

    // Initial setup
    setupFirebase();
    clearSearchBtn.classList.add('d-none');
    
 
});