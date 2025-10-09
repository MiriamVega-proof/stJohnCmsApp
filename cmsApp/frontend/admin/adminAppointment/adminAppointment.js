/* adminAppointment.js
    Handles client-side filtering, pagination, the Reschedule Modal, and Logout confirmation.
*/

// --- Logout Handler (NEW: Global function with confirmation) ---
window.handleLogout = () => {
    if (confirm("Are you sure you want to log out?")) {
        // In a real application, you would replace this with an API call to clear the session
        console.log("User logged out.");
        // Redirect to the login page (ensure this path is correct for your project structure)
        window.location.href = "../../../frontend/auth/login/login.html";
    }
};

// --- Fetch Appointment Counts ---
function fetchAppointmentCounts() {
    fetch('../../../../cms.api/fetchAppointments.php')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.success) {
                updateAppointmentCounts(data.data);
            }
        })
        .catch(error => {
            // Handle fetch errors silently
        });
}

// --- Update Appointment Count Cards ---
function updateAppointmentCounts(appointments) {
    let scheduledCount = 0;
    let completedCount = 0;
    let cancelledCount = 0;
    let confirmedCount = 0;
    
    appointments.forEach((appointment) => {
        const status = (appointment.status || '').toLowerCase().trim();
        const statusId = parseInt(appointment.statusId) || 0;
        
        // Count based on status enum or statusId
        if (status === 'scheduled' || (status === '' && statusId === 0)) {
            scheduledCount++;
        } else if (status === 'completed') {
            completedCount++;
        } else if (status === 'cancelled') {
            cancelledCount++;
        } else if (status === 'confirmed') {
            confirmedCount++;
        }
    });
    
    // Update the dashboard cards
    const confirmedElement = document.getElementById('confirmed-count');
    const scheduledElement = document.getElementById('scheduled-count');
    const cancelledElement = document.getElementById('cancelled-count');
    const completedElement = document.getElementById('completed-count');
    
    if (confirmedElement) confirmedElement.textContent = confirmedCount;
    if (scheduledElement) scheduledElement.textContent = scheduledCount;
    if (cancelledElement) cancelledElement.textContent = cancelledCount;
    if (completedElement) completedElement.textContent = completedCount;
}

document.addEventListener('DOMContentLoaded', () => {
    // Fetch and display appointment counts
    fetchAppointmentCounts();
    
    const tableBody = document.getElementById('appointmentTableBody');
    const searchInput = document.getElementById('appointmentSearch');
    const filterStatus = document.getElementById('filterStatus');
    const filterDate = document.getElementById('filterDate');
    const pageInfo = document.getElementById('pageInfo');
    const prevPageBtn = document.getElementById('prevPageBtn');
    const nextPageBtn = document.getElementById('nextPageBtn');
    const noLogsMessage = document.getElementById('noLogsMessage');
    const recordCountSpan = document.getElementById('recordCount');
    
    // Attach logout handler to the links (Requires changes in HTML, see note below)
    document.getElementById('logoutLinkDesktop')?.addEventListener('click', (e) => { e.preventDefault(); handleLogout(); });
    document.getElementById('logoutLinkMobile')?.addEventListener('click', (e) => { e.preventDefault(); handleLogout(); });

    // Modal elements
    const rescheduleModal = new bootstrap.Modal(document.getElementById('rescheduleModal'));
    const rescheduleClientName = document.getElementById('rescheduleClientName');
    const newAppointmentDate = document.getElementById('newAppointmentDate');
    const newAppointmentTime = document.getElementById('newAppointmentTime');
    const saveRescheduleBtn = document.getElementById('saveRescheduleBtn');
    
    const rowsPerPage = 10;
    let currentPage = 1;
    let allRows = []; 
    let filteredRows = [];
    let currentRescheduleRow = null;


    /** Converts a display date string (e.g., "May 5, 2025") to YYYY-MM-DD. */
    const formatDateToYMD = (dateString) => {
        const dateObj = new Date(dateString);
        if (isNaN(dateObj)) return null;
        return dateObj.toISOString().split('T')[0];
    };

    /** Initializes the table data by grabbing all rows from the DOM. */
    const initializeTableData = () => {
        allRows = Array.from(tableBody.querySelectorAll('tr'));
        filterAppointments();
    };

    // --- Core Filtering Logic (Kept the same) ---
    window.filterAppointments = () => {
        const searchTerm = searchInput.value.toLowerCase().trim();
        const status = filterStatus.value.toLowerCase();
        const filterDateValue = filterDate.value;
        
        filteredRows = allRows.filter(row => {
            const rowText = row.textContent.toLowerCase();
            const rowStatus = row.getAttribute('data-status').toLowerCase();
            
            const searchMatch = !searchTerm || rowText.includes(searchTerm);
            const statusMatch = status === 'all' || rowStatus === status;

            let dateMatch = true;
            if (filterDateValue) {
                const dateCellText = row.querySelector('.appointment-details').textContent;
                const dateMatchRegex = dateCellText.match(/Date:\s*(\w+\s\d+,\s\d{4})/);
                
                if (dateMatchRegex && dateMatchRegex[1]) {
                    const rowDateYMD = formatDateToYMD(dateMatchRegex[1]);
                    dateMatch = rowDateYMD === filterDateValue;
                } else {
                    dateMatch = false; 
                }
            }
            return searchMatch && statusMatch && dateMatch;
        });

        currentPage = 1; 
        renderTable();
    };

    window.clearFilters = () => {
        searchInput.value = '';
        filterStatus.value = 'all';
        filterDate.value = '';
        filterAppointments();
    };

    // --- Table Rendering and Pagination (Kept the same) ---
    const renderTable = () => {
        tableBody.innerHTML = '';
        const rows = filteredRows;
        const totalPages = Math.ceil(rows.length / rowsPerPage);
        
        currentPage = Math.min(Math.max(1, currentPage), totalPages || 1);
        
        const start = (currentPage - 1) * rowsPerPage;
        const end = start + rowsPerPage;
        const pageRows = rows.slice(start, end);

        pageRows.forEach(row => tableBody.appendChild(row));

        const displayTotalPages = totalPages || 1;
        pageInfo.textContent = `Page ${currentPage} of ${displayTotalPages}`;
        recordCountSpan.textContent = rows.length;

        prevPageBtn.disabled = currentPage === 1;
        nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;

        if (rows.length === 0) {
            noLogsMessage.classList.remove('d-none');
        } else {
            noLogsMessage.classList.add('d-none');
        }
    };
    
    // --- Status Update Helper (FIXED LOGIC) ---
    const updateStatusUI = (row, newStatus) => {
        row.setAttribute('data-status', newStatus);
        const badge = row.querySelector('.status-display');
        
        badge.classList.remove('confirmed', 'pending', 'cancelled', 'completed');
        badge.classList.add(newStatus);
        badge.textContent = newStatus.charAt(0).toUpperCase() + newStatus.slice(1);
        
        // FIX: Only disable the button that represents the CURRENT status.
        // Other buttons (reschedule, cancel) must remain clickable.
        row.querySelectorAll('.action-buttons button[data-action]').forEach(btn => {
            const action = btn.getAttribute('data-action');
            // Disable the button if its action matches the new (current) status
            btn.disabled = action === newStatus;
        });
        
        initializeTableData(); 
    };

    // --- Action Button Delegation ---
    tableBody.addEventListener('click', (e) => {
        const button = e.target.closest('button');
        // Allow click only if button is present AND NOT disabled
        if (!button || button.disabled) return; 

        const action = button.getAttribute('data-action');
        const row = button.closest('tr');
        const clientName = row.querySelector('td:first-child').textContent;
        currentRescheduleRow = row; 

        if (action === 'reschedule') {
            rescheduleClientName.textContent = clientName;
            newAppointmentDate.value = '';
            newAppointmentTime.value = '';
            rescheduleModal.show();
            return;
        }

        // Handle Confirm, Cancel, Complete actions
        let confirmationText = `Are you sure you want to ${action.toUpperCase()} the appointment for ${clientName}?`;
        if (action === 'confirm' && row.getAttribute('data-status') === 'confirmed') {
             // Allow re-confirmation without unnecessary alert if already confirmed
             updateStatusUI(row, 'confirmed');
             return;
        }
        
        if (confirm(confirmationText)) {
            console.log(`[API Call]: ${action.toUpperCase()} appointment for ${clientName}`);
            
            if (action === 'confirm') {
                updateStatusUI(row, 'confirmed');
            } else if (action === 'cancel') {
                updateStatusUI(row, 'cancelled');
            } else if (action === 'complete') {
                 updateStatusUI(row, 'completed');
            }
        }
    });
    
    // --- Save Reschedule Button Handler (Kept the same) ---
    saveRescheduleBtn.addEventListener('click', () => {
        const newDate = newAppointmentDate.value;
        const newTime = newAppointmentTime.value;

        if (!newDate || !newTime) {
            alert("Please select both a new date and time.");
            return;
        }
        
        if (!currentRescheduleRow) return;

        const clientName = rescheduleClientName.textContent;
        
        console.log(`[API Call]: RESCHEDULED ${clientName} to ${newDate} at ${newTime}`);
        
        const detailsCell = currentRescheduleRow.querySelector('.appointment-details');
        
        const readableDate = new Date(newDate).toLocaleDateString('en-US', { 
            month: 'long', 
            day: 'numeric', 
            year: 'numeric' 
        });

        detailsCell.innerHTML = `Date: ${readableDate} <br> Time: ${newTime}`;
        
        // Rescheduling typically confirms the new time.
        updateStatusUI(currentRescheduleRow, 'confirmed'); 

        rescheduleModal.hide();
        currentRescheduleRow = null;
    });

    // --- Pagination Function (Globally accessible) ---
    window.changePage = (direction) => {
        currentPage += direction;
        renderTable();
    };

    // Initial application startup
    initializeTableData();
});