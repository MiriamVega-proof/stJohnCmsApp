document.addEventListener('DOMContentLoaded', () => {
    
    // Function to set all date inputs to the current date, for convenience
    const setDefaultDates = (form, isStart = true) => {
        const today = new Date().toISOString().split('T')[0];
        const inputId = isStart ? `${form.dataset.reportType}TimeframeStart` : `${form.dataset.reportType}TimeframeEnd`;
        const inputElement = form.querySelector(`#${inputId}`);
        if (inputElement) {
            inputElement.value = today;
        }
    };
    
    const handleReportGeneration = (event) => {
        event.preventDefault(); // Stop the form from traditional submission

        const form = event.target.closest('form');
        if (!form) return;

        const reportType = form.dataset.reportType;
        const button = event.target.closest('.generate-report-btn');
        if (!button) return;

        const format = button.dataset.format;
        
        // All forms now use a standard date range
        const startDate = form.querySelector(`#${reportType}TimeframeStart`).value;
        const endDate = form.querySelector(`#${reportType}TimeframeEnd`).value;

        if (!startDate || !endDate) {
            alert(`Please select both a Start Date and an End Date for the ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report.`);
            return;
        }
        
        if (new Date(startDate) > new Date(endDate)) {
             alert('The Start Date cannot be after the End Date. Please check your date range.');
            return;
        }

        // Simulate API call and button disabling
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span> Generating...';

        console.log(`Requesting: ${reportType} report for range ${startDate} to ${endDate} in ${format} format.`);

        // --- Backend API Call Simulation ---
        setTimeout(() => {
            // Re-enable button and reset text
            button.disabled = false;
            button.innerHTML = `<i class="fas fa-file-${format === 'pdf' ? 'pdf' : 'excel'}"></i> ${format.toUpperCase()}`;
            
            // Success feedback
            alert(`✅ ${reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report (${format.toUpperCase()}) successfully prepared for download.`);
            
            // In a real application, you would trigger the file download here
            // window.open(`/api/reports/generate?type=${reportType}&start=${startDate}&end=${endDate}&format=${format}`);
            
        }, 2000); // Simulated 2-second API processing time
    };

    // Initialize listeners and optionally set default date for ALL date range forms
    document.querySelectorAll('[data-report-type]').forEach(form => {
        // Optionally pre-fill the date range to today's date for a quicker test
        // setDefaultDates(form, true); 
        // setDefaultDates(form, false); 
        
        // Attach listener to all report buttons within the form
        form.querySelectorAll('.generate-report-btn').forEach(button => {
            button.addEventListener('click', handleReportGeneration);
        });
    });

    // ✅ FIXED LOGOUT FUNCTIONALITY (Ensures proper alert + redirect)
    const logoutLinks = document.querySelectorAll('#logoutLinkDesktop, #logoutLinkMobile');

    if (logoutLinks.length === 0) {
        console.warn("⚠️ No logout link found (IDs: #logoutLinkDesktop or #logoutLinkMobile). Add these elements to enable logout functionality.");
    }

    logoutLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();
            if (confirm('Are you sure you want to log out?')) {
                const redirectPath = link.getAttribute('href') && link.getAttribute('href') !== '#'
                    ? link.getAttribute('href')
                    : '../../frontend/auth/login/login.php'; // fallback
                alert('You have successfully logged out.');
                window.location.href = redirectPath;
            }
        });
    });
});
