// login.js - Complete, Final, and Corrected Version (Fixed success message color)

// =========================================================================
// 1. LOGIN FORM LOGIC
// =========================================================================

document.getElementById("loginForm").addEventListener("submit", function(e) {
    e.preventDefault();

    // Clear old error messages
    document.getElementById("emailError").textContent = "";
    document.getElementById("passwordError").textContent = "";
    document.getElementById("serverMessage").textContent = "";

    // Get form values
    let email = document.getElementById("email").value.trim();
    let password = document.getElementById("password").value.trim();
    let hasError = false;

    // Validation
    if (email === "") {
        document.getElementById("emailError").textContent = "Email is required";
        hasError = true;
    } else if (!/^\S+@\S+\.\S+$/.test(email)) {
        document.getElementById("emailError").textContent = "Invalid email format";
        hasError = true;
    }
    if (password === "") {
        document.getElementById("passwordError").textContent = "Password is required";
        hasError = true;
    } else if (password.length < 6) {
        document.getElementById("passwordError").textContent = "Password must be at least 6 characters";
        hasError = true;
    }

    if (hasError) return;

    // Send request to PHP
    const formData = new FormData();
    formData.append("email", email);
    formData.append("password", password);

    fetch("http://localhost/stJohnCmsApp/cms.api/login.php", {
        method: "POST",
        body: formData
    })
    .then(res => res.json())
    .then(data => {
        const serverMessageEl = document.getElementById("serverMessage");
        if (data.status === "success") {
            serverMessageEl.style.color = "green";
            serverMessageEl.textContent = data.message;

            setTimeout(() => {
                const userRole = data.role ? data.role.toLowerCase() : '';
                if (userRole === "admin") {
                    window.location.href = "../../admin/adminDashboard/adminDashboard.php";
                } else if (userRole === "secretary") {
                    window.location.href = "../../secretary/secretaryDashboard.php";
                } else if (userRole === "client") {
                    window.location.href = "../../client/clientDashboard/clientDashboard.php";
                } else {
                    console.error("Unknown user role:", data.role);
                    alert("Unknown user role. Cannot redirect.");
                }
            }, 1000);
        } else {
            serverMessageEl.style.color = "red";
            serverMessageEl.textContent = data.message;
        }
    })
    .catch(err => {
        console.error("Fetch error:", err);
        document.getElementById("serverMessage").style.color = "red";
        document.getElementById("serverMessage").textContent = "An error occurred. Please try again.";
    });
});

// Function to toggle password visibility
function togglePassword() {
    const passwordField = document.getElementById("password");
    const toggleIcon = document.querySelector(".password-toggle-icon");

    if (passwordField.type === "password") {
        passwordField.type = "text";
        toggleIcon.classList.remove("bi-eye-slash");
        toggleIcon.classList.add("bi-eye");
    } else {
        passwordField.type = "password";
        toggleIcon.classList.remove("bi-eye");
        toggleIcon.classList.add("bi-eye-slash");
    }
}

// Image Modal functionality
function openModal(element) {
    document.getElementById("modal").style.display = "block";
    document.getElementById("modal-img").src = element.src;
    document.getElementById("caption").textContent = element.alt;
}

function closeModal() {
    document.getElementById("modal").style.display = "none";
}

// =========================================================================
// 2. APPOINTMENT CALENDAR, LOCAL STORAGE & UI FUNCTIONS
// =========================================================================

const storageKey = 'bsjAppointments';
function loadAppointments(){
    try {
        const raw = localStorage.getItem(storageKey);
        return raw ? JSON.parse(raw) : [];
    } catch(e){ return []; }
}
function saveAppointments(arr){
    localStorage.setItem(storageKey, JSON.stringify(arr));
}
function uid(){ return 'id_' + Math.random().toString(36).slice(2,9); }

// DOM refs
const calendarGrid = document.getElementById('calendarGrid');
const monthLabel = document.getElementById('monthLabel');
const prevMonthBtn = document.getElementById('prevMonth');
const nextMonthBtn = document.getElementById('nextMonth');
const todayBtn = document.getElementById('todayBtn');
const modalBackdrop = document.getElementById('modalBackdrop');
const apptForm = document.getElementById('apptForm');
const apptClient = document.getElementById('apptClient');
const apptDate = document.getElementById('apptDate');
const apptTime = document.getElementById('apptTime');
const apptNotes = document.getElementById('apptNotes');
const editingId = document.getElementById('editingId');
const deleteBtn = document.getElementById('deleteBtn');
const cancelBtn = document.getElementById('cancelBtn');
const apptCountEl = document.getElementById('apptCount');
const dayApptsEl = document.getElementById('dayAppts');
const selectedDayHeading = document.getElementById('selectedDayHeading');

let current = new Date();
let currentMonth = current.getMonth();
let currentYear = current.getFullYear();
let appointments = loadAppointments(); 
let selectedDate = null; 

function renderCalendar(month, year) {
    Array.from(calendarGrid.querySelectorAll('.day')).forEach(n => n.remove());
    const firstDayIndex = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const monthNames = ["January","February","March","April","May","June","July","August","September","October","November","December"];
    monthLabel.textContent = `${monthNames[month]} ${year}`;

    for (let i = 0; i < firstDayIndex; i++) {
        const blank = document.createElement('div');
        blank.className = 'day other-month';
        calendarGrid.appendChild(blank);
    }
    const todayIso = new Date().toLocaleDateString('en-CA');

    for (let d = 1; d <= daysInMonth; d++) {
        const dateObj = new Date(year, month, d);
        const dateStr = dateObj.toLocaleDateString('en-CA');
        const dayEl = document.createElement('div');
        dayEl.className = 'day';
        dayEl.dataset.date = dateStr;

        const num = document.createElement('div');
        num.className = 'date-num';
        num.textContent = d;
        dayEl.appendChild(num);

        const dayAppts = appointments.filter(a => a.date === dateStr);
        if (dayAppts.length > 0) {
            const indicator = document.createElement('div');
            indicator.className = 'light-indicator';
            const now = new Date();
            const dayDate = new Date(dateStr);
            const diffDays = Math.ceil((dayDate - now) / (1000 * 60 * 60 * 24));
            
            let color = '';
            const hasConfirmed = dayAppts.some(a => a.status === 'confirmed'); 
            const hasCancelled = dayAppts.some(a => a.status === 'cancelled');

            if (hasCancelled) { color = 'gray'; } 
            else if (hasConfirmed) { color = 'green'; } 
            else if (dayAppts.some(a => !a.time)) { color = 'red'; } 
            else if (diffDays === 0) { color = 'green'; } 
            else if (diffDays <= 2 && diffDays > 0) { color = 'blue'; } 
            else if (diffDays < 0) { color = 'gray'; } 
            else { color = 'lightblue'; }

            indicator.style.backgroundColor = color;
            dayEl.appendChild(indicator);
            dayEl.style.boxShadow = `0 0 6px ${color}80`;
        }

        if (dateStr === todayIso) { dayEl.style.border = '2px solid #4caf50'; }

        dayEl.addEventListener('click', () => openDay(dateStr));
        calendarGrid.appendChild(dayEl);
    }

    if (selectedDate) {
        updateSidebar(selectedDate);
    } else {
        apptCountEl.textContent = appointments.length; 
    }
}

function openDay(dateStr){
    selectedDate = dateStr;
    Array.from(calendarGrid.querySelectorAll('.day'))
        .forEach(d => d.classList.toggle('selected', d.dataset.date === dateStr));

    selectedDayHeading.textContent = new Date(dateStr).toLocaleDateString();
    updateSidebar(dateStr);
}

function updateSidebar(dateStr){
    const appts = appointments.filter(a => a.date === dateStr);
    dayApptsEl.innerHTML = '';
    if(appts.length === 0){
        dayApptsEl.innerHTML = `<div class="empty">No appointments for this day. Click "+ New" to add one, or click a day to add.</div>`;
    } else {
        appts.forEach(a => {
            const card = document.createElement('div');
            card.className = 'card mb-2';
            const statusText = a.status ? `Status: <strong>${a.status}</strong>` : 'Status: Unknown (Local)';
            card.innerHTML = `<div class="card-body p-2">
                <div style="display:flex;justify-content:space-between;align-items:center">
                    <div>
                        <div style="font-weight:700">${a.client || '—'}</div>
                        <div class="muted small">${a.time ? a.time + ' • ' : ''}${a.notes ? a.notes : ''}</div>
                        <div class="muted small">${statusText}</div> 
                    </div>
                    <div style="display:flex;flex-direction:column;gap:6px">
                        <button class="btn btn-sm btn-outline-primary btn-edit" data-id="${a.id}">Edit</button>
                        <button class="btn btn-sm btn-outline-danger btn-del" data-id="${a.id}">Delete</button>
                    </div>
                </div>
            </div>`;
            dayApptsEl.appendChild(card);
        });

        // wire edit/delete buttons (Local Storage logic)
        dayApptsEl.querySelectorAll('.btn-edit').forEach(btn => {
            btn.addEventListener('click', (e)=>{
                const id = btn.dataset.id;
                openEditById(id);
            });
        });
        dayApptsEl.querySelectorAll('.btn-del').forEach(btn => {
            btn.addEventListener('click', (e)=>{
                const id = btn.dataset.id;
                if(confirm('Delete this appointment?')){
                    appointments = appointments.filter(a => a.id !== id);
                    saveAppointments(appointments); // Only deletes from Local Storage!
                    renderCalendar(currentMonth, currentYear);
                    updateSidebar(selectedDate);
                }
            });
        });
    }
    apptCountEl.textContent = appointments.length; 
}

function showModal(){
    modalBackdrop.style.display = 'flex';
    modalBackdrop.setAttribute('aria-hidden', 'false');
    deleteBtn.style.display = 'none';
    editingId.value = '';
    setTimeout(()=>apptClient.focus(), 200);
}

function hideModal(){
    modalBackdrop.style.display = 'none';
    modalBackdrop.setAttribute('aria-hidden', 'true');
    apptFormReset();
}

function apptFormReset(){
    apptClient.value = '';
    apptDate.value = '';
    apptTime.value = '';
    apptNotes.value = '';
    editingId.value = '';
    deleteBtn.style.display = 'none';
}

function openEditById(id){
    const a = appointments.find(x => x.id === id);
    if(!a) return;
    editingId.value = a.id;
    apptClient.value = a.client || '';
    apptDate.value = a.date || '';
    apptTime.value = a.time || '';
    apptNotes.value = a.notes || '';
    deleteBtn.style.display = 'inline-block';
    showModal();
}

function saveAppointmentFromModal(){
    const id = editingId.value || uid();
    const obj = {
        id,
        client: apptClient.value.trim(),
        date: apptDate.value,
        time: apptTime.value,
        notes: apptNotes.value.trim()
    };
    if(!obj.client || !obj.date){
        alert('Please add client name and date.');
        return false;
    }

    const idx = appointments.findIndex(a => a.id === id);
    if(idx > -1){
        appointments[idx] = obj;
    } else {
        appointments.push(obj);
    }
    saveAppointments(appointments); // Saves to Local Storage!
    renderCalendar(currentMonth, currentYear);
    updateSidebar(obj.date);
    hideModal();
    return true;
}

function deleteAppointmentFromModal(){
    const id = editingId.value;
    if(!id) return;
    if(confirm('Delete this appointment?')){
        appointments = appointments.filter(a => a.id !== id);
        saveAppointments(appointments); // Saves to Local Storage!
        renderCalendar(currentMonth, currentYear);
        hideModal();
    }
}

// modal cancel / delete / save wiring
cancelBtn.addEventListener('click', hideModal);
deleteBtn.addEventListener('click', deleteAppointmentFromModal);
apptForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    saveAppointmentFromModal();
});

// calendar nav
prevMonthBtn.addEventListener('click', ()=>{
    currentMonth--;
    if(currentMonth < 0){ currentMonth = 11; currentYear--; }
    renderCalendar(currentMonth, currentYear);
});
nextMonthBtn.addEventListener('click', ()=>{
    currentMonth++;
    if(currentMonth > 11){ currentMonth = 0; currentYear++; }
    renderCalendar(currentMonth, currentYear);
});
todayBtn.addEventListener('click', ()=>{
    const t = new Date();
    currentMonth = t.getMonth();
    currentYear = t.getFullYear();
    renderCalendar(currentMonth, currentYear);
});

// clicking outside modal to close (backdrop)
modalBackdrop.addEventListener('click', (e)=>{
    if(e.target === modalBackdrop){
        hideModal();
    }
});

// integrate quick-click on calendar days to populate main appointment form date
calendarGrid.addEventListener('click', (e)=>{
    const dayEl = e.target.closest('.day');
    if(!dayEl || !dayEl.dataset.date) return;
    const date = dayEl.dataset.date;
    const mainDateInput = document.getElementById('appointment_date');
    if(mainDateInput) mainDateInput.value = date;
});

// allow double-click to open modal for that date
calendarGrid.addEventListener('dblclick', (e)=>{
    const dayEl = e.target.closest('.day');
    if(!dayEl || !dayEl.dataset.date) return;
    apptFormReset();
    apptDate.value = dayEl.dataset.date;
    showModal();
});

renderCalendar(currentMonth, currentYear);

// =========================================================================
// 3. DATABASE API FUNCTIONS (Load and Submit)
// =========================================================================

// Load appointments from MySQL (XAMPP)
async function loadAppointmentsFromDB() {
    try {
        const res = await fetch("http://localhost/stJohnCmsApp/cms.api/clientAppointment.php");
        
        if (!res.ok) {
            const errorText = await res.text();
            throw new Error(`Failed to load data. Server responded with status ${res.status}. Response: ${errorText.substring(0, 100)}...`);
        }

        const data = await res.json();
        console.log("Fetched appointments from MySQL:", data);
        appointments = Array.isArray(data) ? data : [];
        renderCalendar(currentMonth, currentYear);
    } catch (err) {
        console.error("Error loading appointments from database:", err);
        // Fallback: load local storage if DB fails
        appointments = loadAppointments(); 
        renderCalendar(currentMonth, currentYear);
    }
}

// Refresh appointments right after page load
loadAppointmentsFromDB();

// FINAL AND ONLY ASYNCHRONOUS SUBMISSION HANDLER FOR APPOINTMENT FORM
document.getElementById("appointmentForm").addEventListener("submit", async function (e) {
    // 🛑 CRITICAL FIX: Stop the page reload immediately and run all logic here.
    e.preventDefault(); 

    const appointmentMessage = document.getElementById("appointmentMessage");
    appointmentMessage.textContent = ""; 
    
    // --- 1. Client-Side Validation ---
    const userName = document.getElementById("user_name").value.trim();
    const userEmail = document.getElementById("user_email").value.trim();
    const userAddress = document.getElementById("user_address").value.trim();
    const userPhone = document.getElementById("user_phone").value.trim();
    const appointmentDate = document.getElementById("appointment_date").value.trim();
    const appointmentTime = document.getElementById("appointment_time").value.trim();
    const appointmentPurpose = document.getElementById("appointment_purpose").value.trim();

    // Re-check validation
    if (!userName || !userEmail || !userAddress || !userPhone || !appointmentDate || !appointmentTime || !appointmentPurpose) {
        appointmentMessage.style.color = "red";
        appointmentMessage.textContent = "Please fill in all required fields.";
        return;
    }
    if (!/^\S+@\S+\.\S+$/.test(userEmail)) {
        appointmentMessage.style.color = "red";
        appointmentMessage.textContent = "Please enter a valid email address.";
        return;
    }
    const selectedTime = appointmentTime; 
    const minTime = "07:00";
    const maxTime = "16:00";
    if (selectedTime < minTime || selectedTime > maxTime) {
        appointmentMessage.style.color = "red";
        appointmentMessage.textContent = "Appointment time must be between 7 AM and 4 PM.";
        return;
    }
    
    // --- 2. Prepare Data ---
    const formData = {
        user_name: userName,
        user_email: userEmail,
        user_address: userAddress,
        user_phone: userPhone,
        appointment_date: appointmentDate,
        appointment_time: appointmentTime,
        appointment_purpose: appointmentPurpose,
    };

    try {
        // --- 3. Fetch/POST Request ---
        const res = await fetch("http://localhost/stJohnCmsApp/cms.api/clientAppointment.php", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(formData),
        });

        // --- 4. Handle Response ---
        if (!res.ok) {
            let errorData;
            try {
                errorData = await res.json();
                appointmentMessage.textContent = errorData.message || `Server Error: HTTP ${res.status}`;
            } catch (e) {
                const errorText = await res.text();
                appointmentMessage.textContent = `Server Execution Error (${res.status}). Check PHP file for syntax/connection errors.`;
                console.error("Raw Server Response (Likely PHP Fatal Error):", errorText.substring(0, 500));
            }
            appointmentMessage.style.color = "red";
            return;
        }

        // Process Successful JSON Response
        const data = await res.json(); 
        
        appointmentMessage.textContent = data.message;
        
        // 🟢 FIX: Set color explicitly based on status
        if (data.status === "success") {
            appointmentMessage.style.color = "green";
            document.getElementById("appointmentForm").reset();
            await loadAppointmentsFromDB();
        } else {
            // This handles cases where PHP returns 200 OK, but status is "error"
            appointmentMessage.style.color = "red"; 
        }

    } catch (err) {
        // This catch block handles network issues OR JSON parsing failure.
        console.error("Fetch/Parsing Error:", err);
        appointmentMessage.textContent = `Client-side error: ${err.message}. Check browser console for details.`;
        appointmentMessage.style.color = "red"; // 🛑 Corrected: client-side errors should be red
    }
});