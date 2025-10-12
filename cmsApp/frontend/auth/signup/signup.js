// ========== ENHANCED SIGNUP FUNCTIONALITY ========== //

// Toggle password visibility
function togglePassword(inputId, icon) {
    const input = document.getElementById(inputId);
    if (input.type === "password") {
        input.type = "text";
        icon.classList.remove("bi-eye-slash");
        icon.classList.add("bi-eye");
    } else {
        input.type = "password";
        icon.classList.remove("bi-eye");
        icon.classList.add("bi-eye-slash");
    }
}

// Enhanced form animations and interactions
document.addEventListener('DOMContentLoaded', function() {
    // Smooth navbar interactions
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        link.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-2px)';
        });
        
        link.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });

    // Form field focus animations
    const formInputs = document.querySelectorAll('.form-control');
    formInputs.forEach(input => {
        input.addEventListener('focus', function() {
            this.parentElement.classList.add('focused');
        });
        
        input.addEventListener('blur', function() {
            if (!this.value) {
                this.parentElement.classList.remove('focused');
            }
        });
    });

    // Enhanced form submission
    const signupForm = document.getElementById('signupForm');
    signupForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Collect form values
        const firstName = document.getElementById('firstName').value.trim();
        const lastName = document.getElementById('lastName').value.trim();
        const email = document.getElementById('email').value.trim();
        const contactNumber = document.getElementById('contactNumber').value.trim();
        const password = document.getElementById('password').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const emergencyContactName = document.getElementById('emergencyContactName').value.trim();
        const emergencyContactNumber = document.getElementById('emergencyContactNumber').value.trim();

        // Enhanced validation with better UX
        if (!firstName || !lastName || !email || !contactNumber || !password || !confirmPassword || !emergencyContactName || !emergencyContactNumber) {
            showNotification("Please fill in all fields.", "error");
            return;
        }

        // Email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            showNotification("Please enter a valid email address.", "error");
            return;
        }

        // Phone number validation
        const phoneRegex = /^09\d{9}$/;
        if (!phoneRegex.test(contactNumber)) {
            showNotification("Contact number must be 11 digits and start with 09.", "error");
            return;
        }
        if (!phoneRegex.test(emergencyContactNumber)) {
            showNotification("Emergency contact number must be 11 digits and start with 09.", "error");
            return;
        }

        // Password validation
        const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d).{6,}$/;
        if (!passwordRegex.test(password)) {
            showNotification("Password must be at least 6 characters long and contain at least 1 letter and 1 number.", "error");
            return;
        }   

        // Confirm password match
        if (password !== confirmPassword) {
            showNotification("Passwords do not match.", "error");
            return;
        }

        // Show loading state
        const submitBtn = document.querySelector('.btn-signup');
        const originalContent = submitBtn.innerHTML;
        submitBtn.innerHTML = '<i class="bi bi-hourglass-split"></i> Creating Account...';
        submitBtn.disabled = true;

        // Send data to PHP via fetch
        const formData = new FormData(signupForm);

        fetch("http://localhost/stJohnCmsApp/cms.api/signup.php", { 
            method: "POST",
            body: formData
        })
        .then(response => response.text())
        .then(data => {
            if (data.includes("success")) {
                showNotification("✅ Account created successfully! Redirecting to login...", "success");
                
                // Clear form after success
                signupForm.reset();
                
                // Redirect to login after 2 seconds
                setTimeout(() => {
                    window.location.href = '../login/login.php';
                }, 2000);
            } else {
                showNotification(data || "Registration failed. Please try again.", "error");
            }
        })
        .catch(error => {
            console.error("Error:", error);
            showNotification("Something went wrong. Please try again later.", "error");
        })
        .finally(() => {
            // Reset button state
            submitBtn.innerHTML = originalContent;
            submitBtn.disabled = false;
        });
    });
});

// Enhanced notification system
function showNotification(message, type = 'info') {
    // Remove existing notification
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="bi bi-${type === 'success' ? 'check-circle' : type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        </div>
        <button class="notification-close" onclick="this.parentElement.remove()">
            <i class="bi bi-x"></i>
        </button>
    `;

    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#d4edda' : type === 'error' ? '#f8d7da' : '#d1ecf1'};
        color: ${type === 'success' ? '#155724' : type === 'error' ? '#721c24' : '#0c5460'};
        padding: 1rem 1.5rem;
        border-radius: 8px;
        border-left: 4px solid ${type === 'success' ? '#28a745' : type === 'error' ? '#dc3545' : '#17a2b8'};
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 9999;
        max-width: 400px;
        animation: slideInRight 0.3s ease;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
    `;

    document.body.appendChild(notification);

    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentElement) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// Add CSS animations for notifications
const style = document.createElement('style');
style.textContent = `
    @keyframes slideInRight {
        from {
            opacity: 0;
            transform: translateX(100%);
        }
        to {
            opacity: 1;
            transform: translateX(0);
        }
    }
    
    @keyframes slideOutRight {
        from {
            opacity: 1;
            transform: translateX(0);
        }
        to {
            opacity: 0;
            transform: translateX(100%);
        }
    }
    
    .notification-content {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }
    
    .notification-close {
        background: none;
        border: none;
        color: inherit;
        cursor: pointer;
        padding: 0;
        font-size: 1.2rem;
        opacity: 0.7;
        transition: opacity 0.2s;
    }
    
    .notification-close:hover {
        opacity: 1;
    }
`;
document.head.appendChild(style);
