// Get DOM elements
const resetForm = document.getElementById("resetForm");
const newPassword = document.getElementById("newPassword");
const confirmPassword = document.getElementById("confirmPassword");
const errorMsg = document.getElementById("errorMsg");

// Create a dynamic message element for success feedback
const successMsg = document.createElement("p");
successMsg.style.color = "green";
successMsg.style.fontSize = "14px";
successMsg.style.textAlign = "center";
successMsg.style.display = "none";
resetForm.appendChild(successMsg);

// Password strength pattern:
// ^(?=.*[a-z])       → must contain a lowercase letter
// (?=.*[A-Z])        → must contain an uppercase letter
// (?=.*\d)           → must contain a digit
// (?=.*[@$!%*?&])    → must contain a special character
// [A-Za-z\d@$!%*?&]  → allowed characters
// {8,}               → at least 8 characters long
const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

// Form submit handler
resetForm.addEventListener("submit", function (e) {
    e.preventDefault(); // Prevent page refresh

    // Hide previous messages
    errorMsg.style.display = "none";
    successMsg.style.display = "none";

    const passwordValue = newPassword.value.trim();
    const confirmValue = confirmPassword.value.trim();

    // 1️⃣ Validate password strength
    if (!passwordPattern.test(passwordValue)) {
        errorMsg.style.display = "block";
        errorMsg.style.color = "red";
        errorMsg.textContent = 
            "Password must be at least 8 characters, include uppercase, lowercase, number, and special character.";
        return;
    }

    // 2️⃣ Check password match
    if (passwordValue !== confirmValue) {
        errorMsg.style.display = "block";
        errorMsg.style.color = "red";
        errorMsg.textContent = "Passwords do not match.";
        return;
    }

    // 3️⃣ Success — show message & redirect
    successMsg.style.display = "block";
    successMsg.textContent = "Password reset successful! Redirecting to login...";
    
    // In a real app: send the new password to server here via fetch()
    // Example:
    // fetch("/reset-password", { method: "POST", body: JSON.stringify({ password: passwordValue }) })

    setTimeout(() => {
        window.location.href = "../login/login.php"; // Adjust path as needed
    }, 1500);
});
