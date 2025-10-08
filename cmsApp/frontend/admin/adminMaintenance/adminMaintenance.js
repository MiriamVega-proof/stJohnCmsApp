// adminMaintenance.js

// Sample Data Structure - Includes Lot breakdown (Area/Block, Row, LotNoOnly)
const maintenanceData = [
    { id: 101, client: "Client A", contact: "0917-XXX-XXXX / client.a@example.com", lotNo: "A-12-03", areaBlock: "A", rowNo: "12", lotNoOnly: "03", service: "General Cleaning", requested: "2025-10-10T10:00", submitted: "2025-10-05", status: "Pending", notes: "The area is overgrown with weeds and needs deep cleaning before the scheduled visit.", adminNotes: "" },
    { id: 102, client: "Client B", contact: "0917-XXX-XXXX / client.b@example.com", lotNo: "B-05-01", areaBlock: "B", rowNo: "05", lotNoOnly: "01", service: "Grass Trimming", requested: "2025-10-08T14:00", submitted: "2025-10-04", status: "Completed", notes: "Scheduled for bi-weekly trimming.", adminNotes: "Completed on 2025-10-08." },
    { id: 103, client: "Client C", contact: "0917-XXX-XXXX / client.c@example.com", lotNo: "C-10-02", areaBlock: "C", rowNo: "10", lotNoOnly: "02", service: "Minor Repair", requested: "2025-09-28T09:00", submitted: "2025-09-25", status: "Completed", notes: "Small crack on the marble base needs fixing.", adminNotes: "Repair completed. Used white grout. Marked as done by Admin on 2025-09-28." },
    { id: 104, client: "Client D", contact: "0917-XXX-XXXX / client.d@example.com", lotNo: "D-01-05", areaBlock: "D", rowNo: "01", lotNoOnly: "05", service: "General Cleaning", requested: "2025-10-15T11:00", submitted: "2025-10-06", status: "Pending", notes: "First cleaning requested.", adminNotes: "" },
    { id: 105, client: "Client E", contact: "0917-XXX-XXXX / client.e@example.com", lotNo: "E-07-04", areaBlock: "E", rowNo: "07", lotNoOnly: "04", service: "Grass Trimming", requested: "2025-09-20T13:00", submitted: "2025-09-18", status: "Cancelled", notes: "Client called to postpone service.", adminNotes: "Cancelled per client request. Awaiting reschedule." },
    { id: 106, client: "Client F", contact: "0917-XXX-XXXX / client.f@example.com", lotNo: "F-02-11", areaBlock: "F", rowNo: "02", lotNoOnly: "11", service: "General Cleaning", requested: "2025-10-12T08:00", submitted: "2025-10-07", status: "Pending", notes: "Regular monthly cleaning.", adminNotes: "" },
    { id: 107, client: "Client G", contact: "0917-XXX-XXXX / client.g@example.com", lotNo: "G-11-01", areaBlock: "G", rowNo: "11", lotNoOnly: "01", service: "Minor Repair", requested: "2025-10-14T16:00", submitted: "2025-10-07", status: "Pending", notes: "Fence post is loose.", adminNotes: "" },
    { id: 108, client: "Client H", contact: "0917-XXX-XXXX / client.h@example.com", lotNo: "A-01-01", areaBlock: "A", rowNo: "01", lotNoOnly: "01", service: "General Cleaning", requested: "2025-10-14T09:00", submitted: "2025-10-07", status: "Pending", notes: "New cleaning contract.", adminNotes: "" },
    { id: 109, client: "Client I", contact: "0917-XXX-XXXX / client.i@example.com", lotNo: "B-03-02", areaBlock: "B", rowNo: "03", lotNoOnly: "02", service: "Grass Trimming", requested: "2025-10-01T15:00", submitted: "2025-09-29", status: "Completed", notes: "Weekly cut.", adminNotes: "Completed on 2025-10-01." },
    { id: 110, client: "Client J", contact: "0917-XXX-XXXX / client.j@example.com", lotNo: "C-05-10", areaBlock: "C", rowNo: "05", lotNoOnly: "10", service: "Minor Repair", requested: "2025-09-22T10:00", submitted: "2025-09-20", status: "Completed", notes: "Fix small tilt on headstone.", adminNotes: "Re-aligned headstone. Completed on 2025-09-22." },
    { id: 111, client: "Client K", contact: "0917-XXX-XXXX / client.k@example.com", lotNo: "D-08-07", areaBlock: "D", rowNo: "08", lotNoOnly: "07", service: "General Cleaning", requested: "2025-10-18T14:00", submitted: "2025-10-10", status: "Pending", notes: "Deep scrub required.", adminNotes: "" },
    { id: 112, client: "Client L", contact: "0917-XXX-XXXX / client.l@example.com", lotNo: "E-10-03", areaBlock: "E", rowNo: "10", lotNoOnly: "03", service: "Grass Trimming", requested: "2025-09-15T11:00", submitted: "2025-09-12", status: "Cancelled", notes: "Client decided to do it themselves this month.", adminNotes: "Cancelled per client call." },
    { id: 113, client: "Client M", contact: "0917-XXX-XXXX / client.m@example.com", lotNo: "F-04-06", areaBlock: "F", rowNo: "04", lotNoOnly: "06", service: "General Cleaning", requested: "2025-10-20T08:00", submitted: "2025-10-11", status: "Pending", notes: "Standard cleaning.", adminNotes: "" },
    { id: 114, client: "Client N", contact: "0917-XXX-XXXX / client.n@example.com", lotNo: "G-12-08", areaBlock: "G", rowNo: "12", lotNoOnly: "08", service: "Minor Repair", requested: "2025-10-25T16:00", submitted: "2025-10-15", status: "Pending", notes: "Small decorative piece fell off.", adminNotes: "" },
    { id: 115, client: "Client O", contact: "0917-XXX-XXXX / client.o@example.com", lotNo: "A-07-02", areaBlock: "A", rowNo: "07", lotNoOnly: "02", service: "Grass Trimming", requested: "2025-10-22T13:00", submitted: "2025-10-14", status: "Pending", notes: "Scheduled bi-weekly.", adminNotes: "" },
];

const recordsPerPage = 10; 
let currentData = maintenanceData;
let currentPage = 1;

const formatDateTime = (dateTimeString) => {
    if (!dateTimeString) return '-';
    try {
        if (dateTimeString.includes('T')) {
            const date = new Date(dateTimeString);
            const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
            if (isNaN(date)) { return dateTimeString.replace('T', ' '); }
            return date.toLocaleDateString('en-US', options);
        }
        return new Date(dateTimeString).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch {
        return dateTimeString;
    }
}

const getStatusBadge = (status) => {
    switch (status) {
        case "Pending": return `<span class="badge badge-pending">${status}</span>`;
        case "Completed": return `<span class="badge badge-completed">${status}</span>`;
        case "Cancelled": return `<span class="badge badge-cancelled">${status}</span>`;
        default: return status;
    }
};

const renderTable = (data, page) => {
    const tableBody = document.getElementById('maintenanceTableBody');
    tableBody.innerHTML = '';
    
    const start = (page - 1) * recordsPerPage;
    const end = start + recordsPerPage;
    const paginatedData = data.slice(start, end);

    paginatedData.forEach((record) => {
        const isCompletedOrCancelled = record.status === 'Completed' || record.status === 'Cancelled';
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${record.client}</td>
            <td class="text-center">${record.areaBlock}</td>
            <td class="text-center">${record.areaBlock}</td> 
            <td class="text-center">${record.rowNo}</td>
            <td class="text-center">${record.lotNoOnly}</td>
            <td>${formatDateTime(record.requested)}</td>
            <td class="text-center">${getStatusBadge(record.status)}</td>
            <td class="text-center text-nowrap">
                <button class="btn btn-sm btn-info text-white view-btn" title="View/Update" data-id="${record.id}" data-bs-toggle="modal" data-bs-target="#requestModal"><i class="fas fa-eye"></i></button>
                <button class="btn btn-sm btn-success complete-btn" title="Mark Completed" data-id="${record.id}" ${isCompletedOrCancelled ? 'disabled' : ''}><i class="fas fa-check"></i></button>
                <button class="btn btn-sm btn-danger cancel-btn" title="Cancel Request" data-id="${record.id}" ${isCompletedOrCancelled ? 'disabled' : ''}><i class="fas fa-times"></i></button>
            </td>
        `;
        tableBody.appendChild(row);
    });

    updatePaginationControls(data.length, page);
};

const updateDashboardMetrics = (data) => {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const pendingCount = data.filter(r => r.status === 'Pending').length;
    const completedCount = data.filter(r => {
        if (r.status === 'Completed') {
            const completedDate = new Date(r.submitted); 
            return completedDate.getMonth() === currentMonth && completedDate.getFullYear() === currentYear;
        }
        return false;
    }).length; 
    const cancelledCount = data.filter(r => r.status === 'Cancelled').length;
    document.getElementById('pendingCount').textContent = pendingCount;
    document.getElementById('completedCount').textContent = completedCount;
    document.getElementById('cancelledCount').textContent = cancelledCount;
};

const applyFilters = () => {
    const searchTerm = document.getElementById('searchClient').value.toLowerCase();
    const serviceFilter = document.getElementById('filterServiceType').value;
    const statusFilter = document.getElementById('filterStatus').value;
    currentData = maintenanceData.filter(record => {
        const matchesSearch = record.client.toLowerCase().includes(searchTerm) || 
                              record.lotNo.toLowerCase().includes(searchTerm) ||
                              record.areaBlock.toLowerCase().includes(searchTerm) ||
                              record.rowNo.toLowerCase().includes(searchTerm) ||
                              record.lotNoOnly.toLowerCase().includes(searchTerm);
        const matchesService = serviceFilter === "" || record.service === serviceFilter;
        const matchesStatus = statusFilter === "" || record.status === statusFilter;
        return matchesSearch && matchesService && matchesStatus;
    });
    currentPage = 1;
    renderTable(currentData, currentPage);
};

const clearFilters = () => {
    document.getElementById('searchClient').value = '';
    document.getElementById('filterServiceType').value = '';
    document.getElementById('filterStatus').value = '';
    applyFilters();
};

const showRequestDetails = (id) => {
    const record = maintenanceData.find(r => r.id === id);
    if (!record) return;
    document.getElementById('requestModalLabel').textContent = `Service Request #${record.id} Details`;
    document.getElementById('modalRequestId').value = record.id;
    document.getElementById('modalClientName').textContent = record.client;
    document.getElementById('modalClientContact').textContent = record.contact; 
    document.getElementById('modalLotLocation').textContent = `${record.areaBlock}-${record.rowNo}-${record.lotNoOnly} (Block: ${record.areaBlock}, Row: ${record.rowNo}, Lot: ${record.lotNoOnly})`;
    document.getElementById('modalServiceType').textContent = record.service;
    document.getElementById('modalRequestedDateTime').textContent = formatDateTime(record.requested);
    document.getElementById('modalSubmittedOn').textContent = record.submitted;
    document.getElementById('modalClientNotes').textContent = record.notes || 'No additional client notes.';
    document.getElementById('updateStatus').value = record.status;
    document.getElementById('scheduledDateTime').value = record.requested.includes('T') ? record.requested.substring(0, 16) : ''; 
    document.getElementById('adminNotes').value = record.adminNotes || '';
};

const saveStatusUpdate = () => {
    const id = parseInt(document.getElementById('modalRequestId').value);
    const newStatus = document.getElementById('updateStatus').value;
    const newAdminNotes = document.getElementById('adminNotes').value;
    const scheduledDateTime = document.getElementById('scheduledDateTime').value;
    const recordIndex = maintenanceData.findIndex(r => r.id === id);
    if (recordIndex === -1) return;
    maintenanceData[recordIndex].status = newStatus;
    maintenanceData[recordIndex].adminNotes = newAdminNotes;
    if (scheduledDateTime) {
        maintenanceData[recordIndex].requested = scheduledDateTime; 
    }
    applyFilters();
    updateDashboardMetrics(maintenanceData);
    const modal = bootstrap.Modal.getInstance(document.getElementById('requestModal'));
    modal.hide();
    alert(`Request #${id} status updated to: ${newStatus}.`);
};

const updateRecordStatus = (id, newStatus) => {
    if (!confirm(`Are you sure you want to mark Request #${id} as ${newStatus}?`)) return;

    const recordIndex = maintenanceData.findIndex(r => r.id === id);
    if (recordIndex === -1) return;

    maintenanceData[recordIndex].status = newStatus;
    maintenanceData[recordIndex].adminNotes = (maintenanceData[recordIndex].adminNotes || '') + `\nStatus updated to ${newStatus} by Admin on ${new Date().toLocaleDateString('en-US')}.`;

    applyFilters();
    updateDashboardMetrics(maintenanceData);
    alert(`Request #${id} successfully marked as ${newStatus}.`);
}

const updatePaginationControls = (totalRecords, currentPage) => {
    const totalPages = Math.ceil(totalRecords / recordsPerPage);
    document.getElementById('recordTotal').textContent = totalRecords;
    document.getElementById('recordStart').textContent = totalRecords === 0 ? 0 : (currentPage - 1) * recordsPerPage + 1;
    document.getElementById('recordEnd').textContent = Math.min(currentPage * recordsPerPage, totalRecords);
    const ul = document.querySelector('.pagination');
    const prevPageItem = document.getElementById('prevPage');
    const nextPageItem = document.getElementById('nextPage');
    prevPageItem.classList.toggle('disabled', currentPage === 1 || totalRecords === 0);
    nextPageItem.classList.toggle('disabled', currentPage === totalPages || totalRecords === 0);
    ul.querySelectorAll('.page-item').forEach(item => {
        if (item.id !== 'prevPage' && item.id !== 'nextPage') {
            item.remove();
        }
    });
    for (let i = 1; i <= totalPages; i++) {
        const li = document.createElement('li');
        li.classList.add('page-item');
        if (i === currentPage) li.classList.add('active');
        li.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
        ul.insertBefore(li, nextPageItem); 
    }
};

const handlePaginationClick = (e) => {
    e.preventDefault();
    const target = e.target.closest('.page-item');
    if (!target || target.classList.contains('disabled')) return;
    if (target.id === 'nextPage') {
        currentPage++;
    } else if (target.id === 'prevPage') {
        currentPage--;
    } else if (e.target.dataset.page) {
        currentPage = parseInt(e.target.dataset.page);
    } else {
        return;
    }
    renderTable(currentData, currentPage);
};

window.handleLogout = (e) => {
    e.preventDefault();
    if (confirm("Are you sure you want to log out?")) {
        window.location.href = "../../../frontend/auth/login/login.html";
    }
};

document.addEventListener('DOMContentLoaded', () => {
    updateDashboardMetrics(maintenanceData);
    renderTable(maintenanceData, currentPage);
    document.getElementById('saveStatusBtn').addEventListener('click', saveStatusUpdate);
    document.querySelector('.pagination').addEventListener('click', handlePaginationClick);
    document.getElementById('clearFiltersBtn').addEventListener('click', clearFilters);
    document.querySelectorAll('.auto-filter-trigger').forEach(element => {
        const eventType = (element.tagName === 'INPUT') ? 'keyup' : 'change';
        element.addEventListener(eventType, applyFilters);
    });
    document.getElementById('maintenanceTableBody').addEventListener('click', (e) => {
        const target = e.target.closest('button');
        if (!target) return;
        const id = parseInt(target.dataset.id);
        if (target.classList.contains('view-btn')) {
            showRequestDetails(id);
        } else if (target.classList.contains('complete-btn')) {
            updateRecordStatus(id, 'Completed');
        } else if (target.classList.contains('cancel-btn')) {
            updateRecordStatus(id, 'Cancelled');
        }
    });
    document.getElementById('logoutLinkDesktop')?.addEventListener('click', handleLogout);
    document.getElementById('logoutLinkMobile')?.addEventListener('click', handleLogout);
});