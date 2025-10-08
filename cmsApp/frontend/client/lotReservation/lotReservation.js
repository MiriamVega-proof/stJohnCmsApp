// ✅ Configure PDF.js worker globally
if (window.pdfjsLib) {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
        "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js";
}

document.addEventListener("DOMContentLoaded", () => {
    // ---- API Base URL ----
    const API_BASE_URL = "http://localhost/stJohnCmsApp/cms.api/";

    // ---- Elements ----
    const form = document.querySelector(".lot-reservation-form");
    const logoutLinks = [document.getElementById("logoutLinkDesktop"), document.getElementById("logoutLinkMobile")];

    const preferredLot = document.getElementById("preferred_lot");
    const depthOption = document.getElementById("depth_option");
    const burialDepthSelect = document.getElementById("burial_depth");

    const docModalEl = document.getElementById("docModal");
    const docModal = docModalEl ? new bootstrap.Modal(docModalEl) : null;
    const docFilename = document.getElementById("docFilename");
    const imgPreview = document.getElementById("img-preview");
    const pdfCanvas = document.getElementById("pdf-canvas");
    const pdfControls = document.getElementById("pdfControls");
    const pageInfo = document.getElementById("pageInfo");
    const prevPageBtn = document.getElementById("prevPage");
    const nextPageBtn = document.getElementById("nextPage");
    const downloadLink = document.getElementById("downloadLink");
    const deleteBtn = document.getElementById("deleteBtn");
    const replaceFileInput = document.getElementById("replaceFileInput");
    const replaceFileLabel = document.querySelector('label[for="replaceFileInput"]');
    const historyTableBody = document.querySelector(".lot-history-table tbody");
    
    // Get the modal body for centering content
    const modalBody = document.querySelector('.modal-body');


    // ---- State ----
    const fileMap = {};
    let currentFileInput = null, currentFileObj = null;
    let pdfDoc = null, currentPage = 1, totalPages = 1;

    // ---- Logout handling ----
    logoutLinks.forEach(link => {
        if (!link) return;
        link.addEventListener("click", e => {
            e.preventDefault();
            localStorage.removeItem("user_token"); // Example: clear token on logout
            window.location.href = "../../auth/login/login.html";
        });
    });

    // ---- Load logged-in username ----
    async function loadUserName() {
        try {
            const res = await fetch(`${API_BASE_URL}displayname.php`, {
                method: "GET", credentials: "include"
            });
            const data = await res.json();
            const desktopNameEl = document.getElementById("user-name-display-desktop");

            const displayName = (data.status === "success" && data.fullName) ? data.fullName : "Guest";
            if (desktopNameEl) desktopNameEl.textContent = displayName;

        } catch (err) {
            console.error("Error fetching user:", err);
            const desktopNameEl = document.getElementById("user-name-display-desktop");
            if (desktopNameEl) desktopNameEl.textContent = "Error";
        }
    }
    loadUserName();

    // ---- Load reservation history ----
    async function loadReservationHistory() {
        try {
            const res = await fetch(`${API_BASE_URL}clientLotReservation.php`, {
                method: "GET", credentials: "include"
            });
            const data = await res.json();

            if (!historyTableBody) return;
            historyTableBody.innerHTML = "";

            if (data.status === "success" && data.data.length > 0) {
                data.data.forEach(row => {
                    const tr = document.createElement("tr");
                    // ✅ MODIFIED: Changed icon to the word 'View'
                    tr.innerHTML = `
                        <td>${row.clientName || "-"}</td>
                        <td>${row.address || "-"}</td>
                        <td>${row.contactNumber || "-"}</td>
                        <td class="text-center">
                            ${row.clientValidId ? 
                                `<a href="#" class="view-history-doc text-decoration-underline text-primary" data-url="${API_BASE_URL}${row.clientValidId}" title="View Document">
                                    View
                                 </a>` 
                                : "N/A"}
                        </td>
                        <td>${row.reservationDate || "-"}</td>
                        <td>${row.area || "-"}</td>
                        <td>${row.block || "-"}</td>
                        <td>${row.rowNumber || "-"}</td>
                        <td>${row.lotNumber || "-"}</td>
                        <td>${row.lotType || "N/A"}</td>
                        <td>${row.price ? "₱" + Number(row.price).toLocaleString() : "-"}</td>
                        <td>${row.status || "N/A"}</span></td>
                    `;
                    historyTableBody.appendChild(tr);
                });
            } else {
                historyTableBody.innerHTML = `<tr><td colspan="12" class="text-center">No reservation history found.</td></tr>`;
            }
        } catch (err) {
            console.error("Error loading history:", err);
            if (historyTableBody) {
                 historyTableBody.innerHTML = `<tr><td colspan="12" class="text-center text-danger">Failed to load history.</td></tr>`;
            }
        }
    }
    loadReservationHistory();
    
    // ✅ Event listener now targets the new class 'view-history-doc'
    historyTableBody?.addEventListener("click", e => {
        const link = e.target.closest('.view-history-doc');
        if (link) {
            e.preventDefault(); 
            const docUrl = link.dataset.url;
            if (docUrl) {
                // The 'true' here signifies this is from the history view, hiding unnecessary buttons
                openFileInModal(null, docUrl, null, true); 
            }
        }
    });


    // ---- Autodetect lot from URL ----
    const urlParams = new URLSearchParams(window.location.search);
    ["area", "block", "lot_number", "rowNumber"].forEach(param => {
        const value = urlParams.get(param.replace('_', ''));
        const el = document.getElementById(param);
        if (value && el) el.value = value;
    });

    if (urlParams.get("lot")) {
        const alertDiv = document.createElement("div");
        alertDiv.className = "alert alert-info alert-dismissible fade show mt-3";
        alertDiv.innerHTML = `
            <i class="fas fa-info-circle me-2"></i> A lot was pre-selected from the map. Please complete the form.
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        `;
        document.querySelector(".lot-reservation-section")?.prepend(alertDiv);
    }

    // Default reservation date = today
    document.getElementById("reservation_date").valueAsDate = new Date();

    // ---- Show/hide burial depth ----
    function toggleDepthOption() {
        if (!preferredLot || !depthOption) return;
        const selected = preferredLot.value;
        // Hide for Mausoleum options (IDs 4 and 5)
        if (["4", "5"].includes(selected)) {
            depthOption.style.display = "none";
            burialDepthSelect?.removeAttribute("required");
        } else {
            depthOption.style.display = "block";
            burialDepthSelect?.setAttribute("required", "required");
        }
    }
    preferredLot?.addEventListener("change", toggleDepthOption);
    toggleDepthOption();

    // ---- File input handling ----
    document.querySelectorAll(".file-input-wrapper").forEach(wrapper => {
        const targetId = wrapper.querySelector(".file-actions")?.getAttribute("data-target");
        const input = document.getElementById(targetId);
        const viewIcon = wrapper.querySelector(".view-icon");
        const filenameSpan = document.getElementById(targetId + "_filename");

        if (!input || !viewIcon) return;
        viewIcon.style.display = "inline-block";

        input.addEventListener("change", () => {
            const file = input.files?.[0];
            if (fileMap[targetId]?.url) URL.revokeObjectURL(fileMap[targetId].url);
            if (file) {
                const url = URL.createObjectURL(file);
                fileMap[targetId] = { file, url };
                if (filenameSpan) {
                    filenameSpan.textContent = file.name;
                    filenameSpan.style.color = "#000";
                }
            } else {
                delete fileMap[targetId];
                if (filenameSpan) {
                    filenameSpan.textContent = "No file chosen";
                    filenameSpan.style.color = "#6c757d";
                }
            }
        });

        viewIcon.addEventListener("click", e => {
            e.preventDefault();
            const file = input.files?.[0];
            if (!file) return alert("No file selected.");
            const url = URL.createObjectURL(file);
            // 'false' here means it's from the form, so all buttons are shown
            openFileInModal(file, url, input, false);
            docModalEl?.addEventListener("hidden.bs.modal", () => URL.revokeObjectURL(url), { once: true });
        });
    });

    form?.addEventListener("submit", async (e) => {
    e.preventDefault();

    // ✅ Validate contact number
    const clientContact = document.getElementById("client_contact")?.value.trim();
    if (!/^(09)\d{9}$/.test(clientContact)) {
        alert("⚠️ Invalid Contact Number. It must be 11 digits and start with '09'.");
        return;
    }

    // ✅ Confirm submission
    if (!confirm("📌 Are you sure you want to submit this reservation request?")) {
        return;
    }

    const formData = new FormData(form);

    try {
        const res = await fetch(form.action, {
            method: "POST",
            body: formData,
            credentials: "include",
        });

        // Handle non-200 responses gracefully
        if (!res.ok) {
            const text = await res.text(); // fallback if response isn’t JSON
            throw new Error(`Server error (${res.status}): ${text}`);
        }

        const result = await res.json();

        if (result.status === "success") {
            alert("✅ Reservation submitted successfully!");
            form.reset();

            // ✅ Reset uploaded files display
            if (typeof fileMap !== "undefined") {
                Object.keys(fileMap).forEach((key) => URL.revokeObjectURL(fileMap[key].url));
            }
            document.querySelectorAll(".file-name").forEach((span) => {
                span.textContent = "No file chosen";
                span.style.color = "#6c757d";
            });

            // ✅ Refresh history table
            if (typeof loadReservationHistory === "function") {
                loadReservationHistory();
            }

            // ✅ Redirect after success
            setTimeout(() => {
                window.location.href = "../payment/payment.html";
            }, 1500);
        } else {
            alert("❌ Error: " + (result.message || "Unknown error occurred."));
        }
    } catch (err) {
        console.error("Reservation submission failed:", err);
        alert("❌ An unexpected error occurred: " + err.message);
    }
});


    // ---- File preview modal ----
    function openFileInModal(file, url, inputEl, isHistoryView = false) {
        currentFileInput = inputEl;
        currentFileObj = file;

        const fileName = file ? file.name : url.split('/').pop();
        if (docFilename) docFilename.textContent = fileName;
        
        // Hide/show footer buttons based on context
        if(deleteBtn) deleteBtn.style.display = isHistoryView ? 'none' : 'inline-block';
        if(replaceFileLabel) replaceFileLabel.style.display = isHistoryView ? 'none' : 'inline-block';

        pdfDoc = null; currentPage = 1; totalPages = 1;
        imgPreview.style.display = "none";
        pdfCanvas.style.display = "none";
        if (pdfControls) pdfControls.style.display = "none";
        
        // ✅ ADDED: Center the content in the modal body to fix the left-alignment issue
        if(modalBody) modalBody.classList.add('text-center');


        const fileType = file ? file.type : '';
        const isImage = fileType.startsWith("image/") || /\.(jpg|jpeg|png|gif)$/i.test(fileName);
        const isPdf = fileType === "application/pdf" || /\.pdf$/i.test(fileName);

        if (isImage) {
            imgPreview.src = url;
            imgPreview.style.display = "block";
            // Ensure image takes full available width in the center-aligned modal
            imgPreview.style.maxWidth = "100%"; 
            imgPreview.style.height = "auto";
            if (downloadLink) { downloadLink.href = url; downloadLink.download = fileName; }
            docModal?.show();
        } else if (isPdf) {
            pdfjsLib.getDocument({ url }).promise.then(loadedPdf => {
                pdfDoc = loadedPdf;
                totalPages = pdfDoc.numPages;
                renderPage(currentPage);
                if (downloadLink) { downloadLink.href = url; downloadLink.download = fileName; }
                if (pdfControls) pdfControls.style.display = "flex";
                docModal?.show();
            }).catch(err => {
                console.error("PDF load error", err);
                alert("Unable to preview PDF. Please use the download button.");
            });
        } else {
            alert("Unsupported file type for preview. Use the download button instead.");
            if (downloadLink) { downloadLink.href = url; downloadLink.download = fileName; }
        }
    }

    function renderPage(num) {
        if (!pdfDoc) return;
        pdfDoc.getPage(num).then(page => {
            // Use the parent element's width, which is centered in the modal body
            const containerWidth = pdfCanvas.parentElement.clientWidth; 
            const viewport = page.getViewport({ scale: 1.2 });
            const scale = containerWidth / viewport.width;
            const scaledViewport = page.getViewport({ scale });

            pdfCanvas.height = scaledViewport.height;
            pdfCanvas.width = scaledViewport.width;

            page.render({ canvasContext: pdfCanvas.getContext("2d"), viewport: scaledViewport }).promise.then(() => {
                pdfCanvas.style.display = "block";
                if (pageInfo) pageInfo.textContent = `Page ${num} of ${totalPages}`;
                if(prevPageBtn) prevPageBtn.disabled = num <= 1;
                if(nextPageBtn) nextPageBtn.disabled = num >= totalPages;
            });
        });
    }

    prevPageBtn?.addEventListener("click", () => { if (currentPage > 1) renderPage(--currentPage); });
    nextPageBtn?.addEventListener("click", () => { if (currentPage < totalPages) renderPage(++currentPage); });

    deleteBtn?.addEventListener("click", () => {
        if (!currentFileInput || !currentFileObj) return;
        if (confirm(`Are you sure you want to delete ${currentFileObj.name}?`)) {
            currentFileInput.value = "";
            const changeEvent = new Event('change', { bubbles: true });
            currentFileInput.dispatchEvent(changeEvent);
            docModal?.hide();
        }
    });

    replaceFileInput?.addEventListener("change", () => {
        const newFile = replaceFileInput.files?.[0];
        if (newFile && currentFileInput) {
            const dt = new DataTransfer();
            dt.items.add(newFile);
            currentFileInput.files = dt.files;
            
            const changeEvent = new Event('change', { bubbles: true });
            currentFileInput.dispatchEvent(changeEvent);

            const newUrl = URL.createObjectURL(newFile);
            docModal?.hide();
            openFileInModal(newFile, newUrl, currentFileInput);
            docModalEl?.addEventListener("hidden.bs.modal", () => URL.revokeObjectURL(newUrl), { once: true });
        }
        replaceFileInput.value = ""; // Reset for next use
    });

    docModalEl?.addEventListener("hidden.bs.modal", () => {
        // Remove centering when modal closes
        if(modalBody) modalBody.classList.remove('text-center'); 
        
        imgPreview.src = "";
        pdfDoc = null;
        currentFileInput = null;
        currentFileObj = null;
    });
});