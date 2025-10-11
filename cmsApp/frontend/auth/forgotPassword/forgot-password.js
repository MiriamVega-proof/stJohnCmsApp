const phoneInput = document.getElementById('phone-input');
const emailInput = document.getElementById('email-input');
const otpChoices = document.querySelectorAll('input[name="otp-method"]');
const recoverForm = document.getElementById('recover-form');
const errorMsg = document.getElementById('error-message'); // For showing errors
const successMsg = document.getElementById('success-message'); // For showing success

// Listen for radio button changes
otpChoices.forEach(choice => {
  choice.addEventListener('change', () => {
    errorMsg.textContent = "";
    successMsg.textContent = "";
    if (choice.value === 'phone' && choice.checked) {
      phoneInput.style.display = 'block';
      phoneInput.required = true;
      emailInput.style.display = 'none';
      emailInput.required = false;
      phoneInput.value = "";
    } 
    else if (choice.value === 'email' && choice.checked) {
      emailInput.style.display = 'block';
      emailInput.required = true;
      phoneInput.style.display = 'none';
      phoneInput.required = false;
      emailInput.value = "";
    }
  });
});

// On form submit
recoverForm.addEventListener('submit', function(event) {
  event.preventDefault();
  errorMsg.textContent = "";
  successMsg.textContent = "";

  const selectedMethod = document.querySelector('input[name="otp-method"]:checked');
  if (!selectedMethod) {
    errorMsg.style.color = "red";
    errorMsg.textContent = "Please select an OTP method first.";
    return;
  }

  if (selectedMethod.value === 'phone') {
    const phonePattern = /^(\+?\d{1,3}[- ]?)?\d{10}$/;
    if (!phoneInput.value.trim()) {
      errorMsg.textContent = "Please enter your phone number.";
      return;
    }
    if (!phonePattern.test(phoneInput.value.trim())) {
      errorMsg.textContent = "Invalid phone format. Example: +639123456789 or 09123456789";
      return;
    }
  }

  if (selectedMethod.value === 'email') {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailInput.value.trim()) {
      errorMsg.textContent = "Please enter your email address.";
      return;
    }
    if (!emailPattern.test(emailInput.value.trim())) {
      errorMsg.textContent = "Invalid email format. Example: name@example.com";
      return;
    }
  }

  // ✅ Show success message instead of redirecting immediately
  let targetValue = selectedMethod.value === 'phone' 
    ? phoneInput.value.trim() 
    : emailInput.value.trim();

  successMsg.style.color = "green";
  successMsg.textContent = `OTP has been sent to your ${selectedMethod.value}: ${targetValue}`;

  // Simulate short delay before redirect (e.g., 2 seconds)
  setTimeout(() => {
    window.location.href = "../verifyOtp/verifyOtp.php";
  }, 2000);
});
