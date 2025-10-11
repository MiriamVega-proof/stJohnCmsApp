// adminCemeteryMap.js
document.addEventListener('DOMContentLoaded', () => {
  const API_BASE = window.location.origin + "/cms.api";

  const endpoints = {
    get: `${API_BASE}/get_lots.php`,
    update: `${API_BASE}/update_lot.php`,
    delete: `${API_BASE}/delete_lot.php`,
  };

  const logoutLink = document.getElementById('logoutLink');
  const expandMapBtn = document.getElementById('expandMapBtn');
  const cemeteryMap = document.getElementById('cemeteryMap');
  const lotList = document.querySelector('.lot-list');
  const lotSearch = document.getElementById('lotSearch');

  const prevPageBtn = document.getElementById('prevPageBtn');
  const nextPageBtn = document.getElementById('nextPageBtn');
  const pageInfoSpan = document.getElementById('pageInfo');

  const editLotModal = document.getElementById('editLotModal');
  const deleteLotModal = document.getElementById('deleteLotModal');

  const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
  const cancelDeleteBtn = document.getElementById('cancelDeleteBtn');

  // Modal handlers
  function setupModalHandlers(modal) {
    if (!modal) return;
    const closeBtn = modal.querySelector('.close-button');
    closeBtn?.addEventListener('click', () => modal.style.display = 'none');
    window.addEventListener('click', (e) => { if (e.target === modal) modal.style.display = 'none'; });
  }
  setupModalHandlers(editLotModal);
  setupModalHandlers(deleteLotModal);

  // State
  let lots = [];
  const lotsPerPage = 5;
  let currentPage = 1;
  let filteredLots = [];
  let currentEditingLotItem = null;
  let lotToDelete = null;
  let _cachedVectorSource = null;

  function findVectorSource() {
    if (_cachedVectorSource) return _cachedVectorSource;
    if (window.vectorSource && typeof window.vectorSource.getFeatures === 'function') return (_cachedVectorSource = window.vectorSource);
    if (window.map && typeof window.map.getLayers === 'function') {
      for (const layer of window.map.getLayers().getArray()) {
        if (layer instanceof ol.layer.Vector) {
          const src = layer.getSource();
          if (src) return (_cachedVectorSource = src);
        }
      }
    }
    return null;
  }

  async function ensureVectorSourceReady(maxRetries = 20, interval = 300) {
    return new Promise(resolve => {
      let tries = 0;
      const attempt = () => {
        const src = findVectorSource();
        if (src) return resolve(src);
        if (++tries >= maxRetries) return resolve(null);
        setTimeout(attempt, interval);
      };
      attempt();
    });
  }

  function normalizeStatus(raw) {
    if (!raw) return 'Available';
    const s = String(raw).trim().toLowerCase();
    if (s.includes('available')) return 'Available';
    if (s.includes('pending')) return 'Pending';
    if (s.includes('reserved')) return 'Reserved';
    if (s.includes('occupied')) return 'Occupied';
    return 'Available';
  }


  //Map updater: color by status (bulletproof)
  async function updateMap(lotsFromServer) {
    lots = lotsFromServer;
    filteredLots = lots;

    const src = await ensureVectorSourceReady();
    if (!src) {
      console.warn("No vector source found for map update");
      return;
    }

    const statusColors = {
      "Available": "rgba(0,200,0,0.6)",
      "Pending": "rgba(0, 47, 255, 0.6)",
      "Reserved": "rgba(255,165,0,0.6)",
      "Occupied": "rgba(200,0,0,0.6)"
    };

    // Iterate over each feature
    src.getFeatures().forEach(f => {
      // Try multiple possible property names for lotId
      const featureId = f.get('lotId') || f.get('lotID') || f.get('id');
      // Find matching lot from server
      const lot = lots.find(l => String(l.lotId) === String(featureId));
      

      if (!lot) {
        console.warn('No matching lot for feature', featureId);
        return;
      }

      // Normalize status for consistent key lookup
      const status = normalizeStatus(lot.status);

      // Assign feature properties (in case they were missing)
      f.set('lotId', lot.lotId);
      f.set('status', status);

      // Determine fill color
      const color = statusColors[status] || "rgba(180,180,180,0.6)";

      // Apply style
      f.setStyle(
        new ol.style.Style({
          stroke: new ol.style.Stroke({ color: '#333', width: 1 }),
          fill: new ol.style.Fill({ color }),
          text: new ol.style.Text({
            text: `Lot ${lot.lotNumber}`,
            font: '12px Calibri,sans-serif',
            fill: new ol.style.Fill({ color: '#000' }),
            stroke: new ol.style.Stroke({ color: '#fff', width: 2 })
          })
        })
      );
    });

    // Refresh the lot list UI
    refreshLotList();
  }

  async function loadLots() {
    try {
      const res = await fetch(endpoints.get);
      if (!res.ok) throw new Error("Server error " + res.status);
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Failed to load lots");
      updateMap(data.data);
    } catch (err) {
      console.error("Failed to load lots:", err);
      alert("Failed to load lots from server.");
    }
  }

  function paginateLots() {
    const startIndex = (currentPage - 1) * lotsPerPage;
    const endIndex = startIndex + lotsPerPage;
    const paginatedLots = filteredLots.slice(startIndex, endIndex);

    lotList.innerHTML = '';
    paginatedLots.forEach(lot => {
      const lotItem = document.createElement('div');
      lotItem.classList.add('lot-item');
      lotItem.dataset.id = lot.lotId || '';
      lotItem.dataset.userId = lot.userId || '';
      lotItem.dataset.block = lot.block || '';
      lotItem.dataset.area = lot.area || '';
      lotItem.dataset.rowNumber = lot.rowNumber || '';
      lotItem.dataset.lotNumber = lot.lotNumber || '';
      lotItem.dataset.type = lot.type || '';
      lotItem.dataset.depth = lot.buryDepth || '';
      lotItem.dataset.status = lot.status || '';

      lotItem.innerHTML = `
        <span>${lot.lotId} User ${lot.userId} Block ${lot.block} - Area ${lot.area} - Row ${lot.rowNumber} - Lot ${lot.lotNumber} (${normalizeStatus(lot.status)})</span>
        <div class="lot-item-actions">
          <button class="btn-icon btn-edit"><i class="fas fa-edit"></i></button>
          <button class="btn-icon btn-delete"><i class="fas fa-trash-alt"></i></button>
        </div>`;
      lotList.appendChild(lotItem);
    });

    attachLotItemListeners();
    updatePaginationControls();
  }

  function attachLotItemListeners() {
    lotList.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', e => {
        const lotItem = e.target.closest('.lot-item');
        if (lotItem) openEditLotModal(lotItem);
      });
    });
    lotList.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', e => {
        const lotItem = e.target.closest('.lot-item');
        if (lotItem) openDeleteLotModal(lotItem);
      });
    });
  }

  function updatePaginationControls() {
    const totalPages = Math.ceil(filteredLots.length / lotsPerPage);
    pageInfoSpan.textContent = `Page ${currentPage} of ${totalPages || 1}`;
    prevPageBtn.disabled = currentPage === 1;
    nextPageBtn.disabled = currentPage === totalPages || totalPages === 0;
  }

  function refreshLotList() {
    const searchTerm = lotSearch?.value.toLowerCase() || '';
    filteredLots = lots.filter(l =>
      `${l.lotId} ${l.userId} ${l.block} ${l.area} ${l.rowNumber} ${l.lotNumber} ${l.status} ${l.type}`.toLowerCase().includes(searchTerm)
    );
    currentPage = 1;
    paginateLots();
  }

  document.getElementById('editLotForm').addEventListener('submit', async e => {
    e.preventDefault();
    const updatedLot = {
      lotId: parseInt(document.getElementById('editLotId').value, 10),
      userId: parseInt(document.getElementById('editUserId').value, 10) || null,
      block: document.getElementById('editBlock').value.trim(),
      area: document.getElementById('editArea').value.trim(),
      rowNumber: document.getElementById('editRowNum').value.trim(),
      lotNumber: document.getElementById('editLotNum').value.trim(),
      type: document.getElementById('editType').value,
      buryDepth: document.getElementById('editDepth').value,
      status: document.getElementById('editStatus').value
    };
    try {
      const res = await fetch(endpoints.update, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedLot)
      });
      const data = await res.json();
      if (data.success) {
        editLotModal.style.display = 'none';
        await loadLots();
      } else alert(data.message);
    } catch (err) {
      console.error(err);
    }
  });

  function openEditLotModal(lotItem) {
    currentEditingLotItem = lotItem;
    document.getElementById('editLotId').value = lotItem.dataset.id || '';
    document.getElementById('editUserId').value = lotItem.dataset.userId || '';
    document.getElementById('editBlock').value = lotItem.dataset.block || '';
    document.getElementById('editArea').value = lotItem.dataset.area || '';
    document.getElementById('editRowNum').value = lotItem.dataset.rowNumber || '';
    document.getElementById('editLotNum').value = lotItem.dataset.lotNumber || '';
    document.getElementById('editType').value = lotItem.dataset.type || 'burial';
    document.getElementById('editDepth').value = lotItem.dataset.depth || '4ft';
    document.getElementById('editStatus').value = lotItem.dataset.status || 'Available';
    editLotModal.style.display = 'flex';
  }

  function openDeleteLotModal(lotItem) {
    lotToDelete = { id: lotItem.dataset.id };
    deleteLotModal.style.display = 'flex';
  }

  confirmDeleteBtn?.addEventListener('click', async () => {
    if (!lotToDelete) return;
    try {
      const res = await fetch(endpoints.delete, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ lotId: lotToDelete.id })
      });
      const data = await res.json();
      if (data.success) {
        deleteLotModal.style.display = 'none';
        await loadLots();
      } else alert(data.message);
    } catch (err) {
      console.error(err);
    }
  });

  cancelDeleteBtn?.addEventListener('click', () => { deleteLotModal.style.display = 'none'; lotToDelete = null; });

  logoutLink?.addEventListener('click', e => { e.preventDefault(); if (confirm('Log out?')) window.location.href = '../../auth/login/login.php'; });
  expandMapBtn?.addEventListener('click', () => {
    cemeteryMap.classList.toggle('expanded');
    expandMapBtn.innerHTML = cemeteryMap.classList.contains('expanded')
      ? '<i class="fas fa-compress"></i> Collapse Map'
      : '<i class="fas fa-expand"></i> Expand Map';
    setTimeout(() => window.map?.updateSize?.(), 300);
  });

  lotSearch?.addEventListener('keyup', refreshLotList);
  prevPageBtn.addEventListener('click', () => { if (currentPage > 1) { currentPage--; paginateLots(); } });
  nextPageBtn.addEventListener('click', () => { if (currentPage < Math.ceil(filteredLots.length / lotsPerPage)) { currentPage++; paginateLots(); } });

  loadLots();
});

// Set up PDF.js worker source globally
if (window.pdfjsLib) {
    // Corrected the URL for the PDF worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
}

document.addEventListener('DOMContentLoaded', () => {
    // --- 1. MOCK DATA & STATE ---
    let reservationData = [
        // Added a mock PDF file for testing the View Client ID feature on the first record
        { id: 1, clientName: "Maria A. Erese", address: "123 Rizal Ave, Manila", contact: "09978442421", reservationDate: "2025-09-28", area: "A", block: "1", row: "3", lot: "12", lotType: "3", burialDepth: "4ft", amount: "₱70,000", status: "reserved", submittedOn: "2025-09-27 10:30", updatedOn: "2025-09-28 09:00", docs: { 'client-id': new File(["PDF content for Maria"], "maria_id.pdf", { type: "application/pdf" }) } }, 
        { id: 2, clientName: "Juan Dela Cruz", address: "456 Bonifacio St, Cebu", contact: "09171234567", reservationDate: "2025-10-01", area: "B", block: "2", row: "1", lot: "5", lotType: "1", burialDepth: "6ft", amount: "₱50,000", status: "pending", submittedOn: "2025-09-30 11:00", updatedOn: "2025-09-30 11:00", docs: {} },
        { id: 3, clientName: "Anna Reyes", address: "789 Mabini Blvd, Davao", contact: "09287654321", reservationDate: "2025-09-15", area: "C", block: "5", row: "2", lot: "18", lotType: "4", burialDepth: "N/A", amount: "₱500,000", status: "cancelled", submittedOn: "2025-09-10 15:00", updatedOn: "2025-09-20 12:00", docs: {} },
        { id: 4, clientName: "Peter Jones", address: "101 Aguinaldo Hwy, Cavite", contact: "09951112233", reservationDate: "2024-05-20", area: "A", block: "4", row: "4", lot: "1", lotType: "6", burialDepth: "4ft", amount: "₱300,000", status: "archived", submittedOn: "2024-05-18 09:30", updatedOn: "2024-06-01 17:00", docs: {} }
    ];

    const lotTypeMap = { '1': 'Regular Lot (₱50,000)', '2': 'Regular Lot (₱60,000)', '3': 'Premium Lot (₱70,000)', '4': 'Mausoleum Inside (₱500,000)', '5': 'Mausoleum Roadside (₱600,000)', '6': '4-Lot Package (₱300,000)', '7': 'Exhumation (₱15,000)' };

    // PDF Viewer State
    let pdfDoc = null, currentPage = 1, totalPages = 0, currentFileURL = null;

    // --- 2. DOM ELEMENTS & MODALS ---
    const tableBody = document.getElementById('reservationTableBody');
    const searchInput = document.getElementById('searchInput');
    const clearSearchBtn = document.getElementById('clearSearchBtn');
    const statusFilter = document.getElementById('statusFilter');

    // Modal elements and Bootstrap instances
    const docModalEl = document.getElementById('docModal');
    const docModal = new bootstrap.Modal(docModalEl); 
    const editModalEl = document.getElementById('editReservationModal');
    const editReservationModal = new bootstrap.Modal(editModalEl);
    const cancelModal = new bootstrap.Modal(document.getElementById('cancelReservationModal'));
    const archiveModal = new bootstrap.Modal(document.getElementById('archiveOrDeleteModal'));

    const pdfControls = document.getElementById('pdfControls'), 
          prevPageBtn = document.getElementById('prevPage'), 
          nextPageBtn = document.getElementById('nextPage'), 
          pageInfo = document.getElementById('pageInfo');
    
    // --- 3. HELPER FUNCTIONS ---
    const getRecordById = (id) => reservationData.find(r => r.id === id); 
    const getCurrentTimestamp = () => new Date().toISOString().slice(0, 16).replace('T', ' ');
    const showToast = (message, type = 'success') => {
        const toast = document.createElement('div');
        toast.className = `alert alert-${type} position-fixed top-0 start-50 translate-middle-x mt-3`;
        toast.style.zIndex = '1060'; toast.textContent = message;
        document.body.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    };

    function initializeTooltips() {
        // Dispose of existing tooltips before initializing new ones
        [...document.querySelectorAll('[data-bs-toggle="tooltip"]')].forEach(el => bootstrap.Tooltip.getInstance(el)?.dispose());
        [...document.querySelectorAll('[title]')].forEach(el => { 
            el.setAttribute('data-bs-toggle', 'tooltip'); 
            new bootstrap.Tooltip(el); 
        });
    }

    // --- 4. CORE LOGIC ---
    function renderTable(data) {
        tableBody.innerHTML = '';
        if (data.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="16" class="text-center">No reservations found.</td></tr>';
            return;
        }
        data.forEach(record => {
            // Check for document existence to enable/disable button
            const hasDoc = record.docs && record.docs['client-id']; 
            
            tableBody.insertAdjacentHTML('beforeend', `
            <tr data-record-id="${record.id}">
                <td>${record.clientName}</td>
                <td>${record.address}</td>
                <td>${record.contact}</td>
                <td class="text-center">
                    <button class="action-btn btn-view-id" title="View Client ID" ${!hasDoc ? 'disabled' : ''}>
                        <i class="fas fa-id-card"></i>
                    </button>
                </td>
                <td>${record.reservationDate}</td>
                <td>${record.area}</td>
                <td>${record.block}</td>
                <td>${record.row}</td>
                <td>${record.lot}</td>
                <td>${lotTypeMap[record.lotType] || 'N/A'}</td>
                <td>${record.burialDepth}</td>
                <td>${record.amount}</td>
                <td class="text-center"><span class="status-badge status-${record.status}">${record.status}</span></td>
                <td>${record.submittedOn}</td>
                <td>${record.updatedOn}</td>
                <td class="text-center action-buttons">
                    <button class="action-btn btn-edit" title="Edit"><i class="fas fa-pencil-alt"></i></button>
                    <button class="action-btn btn-cancel" title="Cancel"><i class="fas fa-times-circle"></i></button>
                    <button class="action-btn btn-archive" title="Archive/Delete"><i class="fas fa-archive"></i></button>
                </td>
            </tr>`);
        });
        // Call tooltips after table content is updated
        initializeTooltips(); 
    }

    function applyFilters() {
        const searchTerm = searchInput.value.toLowerCase();
        const status = statusFilter.value;
        renderTable(reservationData.filter(r => 
            (status === 'all' || r.status === status) && 
            (r.clientName.toLowerCase().includes(searchTerm) || String(r.lot).includes(searchTerm))
        ));
    }
    
    // --- 5. MODAL & PDF HANDLERS ---
    function renderPage(num) {
        if (!pdfDoc) return; 

        pdfDoc.getPage(num).then(page => {
            const canvas = document.getElementById('pdf-canvas'), 
                  context = canvas.getContext('2d'), 
                  containerWidth = document.querySelector('#docModal .modal-body').clientWidth; 
            
            const viewport = page.getViewport({ scale: 1.0 });
            const scale = (containerWidth - 30) / viewport.width; 
            const scaledViewport = page.getViewport({ scale: scale });

            canvas.height = scaledViewport.height; 
            canvas.width = scaledViewport.width;
            
            page.render({ canvasContext: context, viewport: scaledViewport }); 
            
            currentPage = num;
            pageInfo.textContent = `Page ${num} of ${totalPages}`;
            prevPageBtn.disabled = num <= 1; 
            nextPageBtn.disabled = num >= totalPages;
        });
    }

    function showDocumentModal(recordId) {
        const record = getRecordById(recordId);
        const file = record.docs ? record.docs['client-id'] : null;
        
        docModalEl.dataset.recordId = recordId;
        
        if (currentFileURL) URL.revokeObjectURL(currentFileURL); 
        
        // Hide all viewers initially
        ['img-preview', 'pdf-canvas'].forEach(id => document.getElementById(id).classList.add('d-none'));
        pdfControls.classList.add('d-none');
        
        // Update button states
        const downloadLink = document.getElementById('downloadLink');
        downloadLink.classList.toggle('disabled', !file);
        document.getElementById('deleteBtn').disabled = !file;
        document.getElementById('replaceFileInput').value = null; // Clear file input

        if (file) {
            currentFileURL = URL.createObjectURL(file);
            document.getElementById('docFilename').textContent = file.name;
            
            if (file.type.startsWith('image/')) {
                document.getElementById('img-preview').src = currentFileURL; 
                document.getElementById('img-preview').classList.remove('d-none');
            } else if (file.type === 'application/pdf') {
                pdfjsLib.getDocument(currentFileURL).promise.then(loadedPdf => {
                    pdfDoc = loadedPdf; 
                    totalPages = pdfDoc.numPages; 
                    currentPage = 1;
                    renderPage(currentPage);
                    
                    document.getElementById('pdf-canvas').classList.remove('d-none');
                    if (totalPages > 1) pdfControls.classList.remove('d-none');
                }).catch(error => {
                    document.getElementById('docFilename').textContent = "Error loading PDF file.";
                    console.error("Error loading PDF:", error);
                });
            } else {
                document.getElementById('docFilename').textContent = `Unsupported file type: ${file.type}`;
            }
            
            downloadLink.href = currentFileURL;
            downloadLink.download = file.name;
        } else {
            document.getElementById('docFilename').textContent = "No ID has been uploaded.";
        }
        
        docModal.show();
    }

    function toggleBurialDepth() {
        const lotType = document.getElementById('editLotType').value;
        const burialDepthField = document.getElementById('burialDepthField');
        
        // Lot types 4 (Mausoleum Inside) and 5 (Mausoleum Roadside) do not require burial depth
        if (lotType === '4' || lotType === '5') { 
            burialDepthField.style.display = 'none';
        } else {
            burialDepthField.style.display = 'block';
        }
    }

    function openEditModal(recordId) {
        const record = getRecordById(recordId);
        if (!record) return;

        editModalEl.dataset.recordId = recordId;
        
        // Populate form fields
        document.getElementById('editingClientName').textContent = record.clientName;
        document.getElementById('editClientName').value = record.clientName;
        document.getElementById('editClientAddress').value = record.address;
        document.getElementById('editClientContact').value = record.contact;
        document.getElementById('editReservationDate').value = record.reservationDate;
        document.getElementById('editArea').value = record.area;
        document.getElementById('editBlock').value = record.block;
        document.getElementById('editRow').value = record.row;
        document.getElementById('editLot').value = record.lot;
        document.getElementById('editLotType').value = record.lotType;
        document.getElementById('editBurialDepth').value = record.burialDepth === 'N/A' ? '4ft' : record.burialDepth; // Default to 4ft if N/A for standard lot types

        toggleBurialDepth(); // Update burial depth visibility
        
        // Reset success message state
        document.getElementById('editReservationForm').classList.remove('d-none');
        document.getElementById('editSuccessMessage').classList.add('d-none');
        document.getElementById('saveEditBtn').classList.remove('d-none');
        document.getElementById('editCancelBtn').textContent = 'Cancel';

        editReservationModal.show();
    }
    
    // --- 6. EVENT LISTENERS ---

    // Event Delegation for all table action buttons
    tableBody.addEventListener('click', (event) => {
        const button = event.target.closest('.action-btn, .btn-view-id');
        if (!button) return;

        const row = button.closest('tr');
        if (!row) return;

        const recordId = parseInt(row.dataset.recordId);
        
        if (button.classList.contains('btn-view-id')) {
            if (!button.disabled) { 
                showDocumentModal(recordId);
            }
        } else if (button.classList.contains('btn-edit')) {
            openEditModal(recordId);
        } else if (button.classList.contains('btn-cancel')) {
            const record = getRecordById(recordId);
            document.getElementById('cancelModalText').textContent = `Are you sure you want to cancel the reservation for ${record.clientName}? This action is irreversible.`;
            document.getElementById('confirmCancelBtn').onclick = () => { 
                // Placeholder for Cancel Logic
                record.status = 'cancelled';
                record.updatedOn = getCurrentTimestamp();
                applyFilters(); 
                cancelModal.hide(); 
                showToast(`Reservation for ${record.clientName} was cancelled.`, 'info');
            };
            cancelModal.show();
        } else if (button.classList.contains('btn-archive')) {
            const record = getRecordById(recordId);
            document.getElementById('archiveModalText').textContent = `Choose an action for the reservation of ${record.clientName}: Archive (hide from main view) or Delete Permanently.`;
            
            // Placeholder logic for Archive/Delete buttons in the modal
            document.getElementById('confirmArchiveBtn').onclick = () => {
                record.status = 'archived';
                record.updatedOn = getCurrentTimestamp();
                applyFilters();
                archiveModal.hide();
                showToast(`Reservation for ${record.clientName} has been archived.`, 'info');
            };
            document.getElementById('confirmDeleteBtn').onclick = () => {
                reservationData = reservationData.filter(r => r.id !== recordId);
                applyFilters();
                archiveModal.hide();
                showToast(`Reservation for ${record.clientName} was deleted permanently.`, 'danger');
            };

            archiveModal.show();
        }
    });

    // Navigation and Filtering Listeners
    document.getElementById('logoutLinkDesktop').addEventListener("click", (e) => { e.preventDefault(); window.location.href = "../../auth/login/login.php"; });
    searchInput.addEventListener('input', applyFilters);
    statusFilter.addEventListener('change', applyFilters);
    clearSearchBtn.addEventListener('click', () => { searchInput.value = ''; applyFilters(); });
    
    // PDF Navigation
    prevPageBtn.addEventListener('click', () => { if (currentPage > 1) renderPage(--currentPage); });
    nextPageBtn.addEventListener('click', () => { if (currentPage < totalPages) renderPage(++currentPage); });

    // Document Modal Actions 
    document.getElementById('replaceFileInput').addEventListener('change', (e) => {
        const file = e.target.files[0]; 
        if (!file) return;
        
        const record = getRecordById(parseInt(docModalEl.dataset.recordId));
        record.docs['client-id'] = file; 
        record.updatedOn = getCurrentTimestamp();

        applyFilters(); 
        showDocumentModal(record.id); 
        showToast('Document replaced successfully!');
    });

    document.getElementById('deleteBtn').addEventListener('click', () => {
        if (!confirm('Are you sure you want to delete the uploaded document? This cannot be undone.')) return;
        
        const record = getRecordById(parseInt(docModalEl.dataset.recordId));
        delete record.docs['client-id']; 
        record.updatedOn = getCurrentTimestamp();
        
        applyFilters(); 
        showDocumentModal(record.id); 
        showToast('Document deleted.', 'danger');
    });

    // Edit Modal Logic
    document.getElementById('editLotType').addEventListener('change', toggleBurialDepth);

    document.getElementById('editReservationForm').addEventListener('submit', (e) => {
        e.preventDefault();
        const record = getRecordById(parseInt(editModalEl.dataset.recordId));
        
        const isMausoleum = document.getElementById('burialDepthField').style.display === 'none';
        
        // Update record object with form data
        Object.assign(record, {
            clientName: document.getElementById('editClientName').value, 
            address: document.getElementById('editClientAddress').value,
            contact: document.getElementById('editClientContact').value, 
            reservationDate: document.getElementById('editReservationDate').value,
            area: document.getElementById('editArea').value, 
            block: document.getElementById('editBlock').value,
            row: document.getElementById('editRow').value, 
            lot: document.getElementById('editLot').value,
            lotType: document.getElementById('editLotType').value, 
            burialDepth: isMausoleum ? 'N/A' : document.getElementById('editBurialDepth').value,
            updatedOn: getCurrentTimestamp()
        });

        applyFilters(); 
        
        // Show success message inside the modal
        document.getElementById('editReservationForm').classList.add('d-none');
        document.getElementById('editSuccessMessage').classList.remove('d-none');
        document.getElementById('saveEditBtn').classList.add('d-none');
        document.getElementById('editCancelBtn').textContent = 'Close';
        showToast('Reservation updated successfully!');
    });

    // Reset Edit Modal state on hide
    editModalEl.addEventListener('hidden.bs.modal', () => {
        document.getElementById('editReservationForm').classList.remove('d-none');
        document.getElementById('editSuccessMessage').classList.add('d-none');
        document.getElementById('saveEditBtn').classList.remove('d-none');
        document.getElementById('editCancelBtn').textContent = 'Cancel';
        document.getElementById('editReservationForm').reset();
    });

    // Document Modal cleanup on hide
    docModalEl.addEventListener('hidden.bs.modal', () => {
        if (currentFileURL) URL.revokeObjectURL(currentFileURL);
        currentFileURL = null; 
        pdfDoc = null;
    });

    // --- 7. INITIALIZATION ---
    renderTable(reservationData);
});
