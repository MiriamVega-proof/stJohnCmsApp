// Grab DOM nodes
const emailInput = document.getElementById("email");
const sendOtpBtn = document.getElementById("send-otp-btn");
const otpInputs = document.querySelectorAll(".otp-inputs input");
const otpForm = document.getElementById("otp-form");
const resendLink = document.getElementById("resend-link");
const message = document.getElementById("message");

// Helper: enable or disable OTP inputs
function toggleOtpInputs(enable = false) {
  otpInputs.forEach(input => {
    input.disabled = !enable;
    if (!enable) input.value = "";
  });
  if (enable) otpInputs[0].focus();
}

// Helper: read OTP string
function getEnteredOtp() {
  return Array.from(otpInputs).map(i => i.value).join("");
}

// Helper: clear OTP inputs
function clearOtpInputs() {
  otpInputs.forEach(i => i.value = "");
  otpInputs[0].focus();
}

// Send OTP handler
sendOtpBtn.addEventListener("click", async () => {
  const email = emailInput.value.trim();
  if (!email) {
    message.style.color = "red";
    message.textContent = "Please enter a valid email.";
    return;
  }

  try {
    sendOtpBtn.disabled = true;
    sendOtpBtn.textContent = "Sending...";
    message.textContent = "";

    const resp = await fetch("http://localhost:5001/send-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await resp.json();

    if (data.success) {
      message.style.color = "green";
      message.textContent = "OTP sent! Check your email.";
      toggleOtpInputs(true);
    } else {
      message.style.color = "red";
      message.textContent = data.error || "Failed to send OTP.";
      toggleOtpInputs(false);
    }
  } catch (err) {
    console.error(err);
    message.style.color = "red";
    message.textContent = "Server error, try again.";
    toggleOtpInputs(false);
  } finally {
    sendOtpBtn.disabled = false;
    sendOtpBtn.textContent = "Send OTP";
  }
});

// OTP input handling (numeric, auto-move, backspace, paste)
otpInputs.forEach((input, index) => {
  input.setAttribute("inputmode", "numeric");
  input.setAttribute("autocomplete", "one-time-code");

  input.addEventListener("input", () => {
    input.value = input.value.replace(/\D/g, "");
    if (input.value.length > 1) input.value = input.value.charAt(0);
    if (input.value.length === 1 && index < otpInputs.length - 1) {
      otpInputs[index + 1].focus();
    }
    message.textContent = "";
  });

  input.addEventListener("keydown", (e) => {
    if (e.key === "Backspace" && input.value === "" && index > 0) {
      otpInputs[index - 1].focus();
    }
    if (e.key === "ArrowLeft" && index > 0) otpInputs[index - 1].focus();
    if (e.key === "ArrowRight" && index < otpInputs.length - 1) otpInputs[index + 1].focus();
  });

  if (index === 0) {
    input.addEventListener("paste", (e) => {
      const paste = (e.clipboardData || window.clipboardData).getData("text");
      const digits = paste.replace(/\D/g, "");
      if (digits.length) {
        e.preventDefault();
        for (let i = 0; i < otpInputs.length; i++) {
          otpInputs[i].value = digits[i] || "";
        }
        const firstEmpty = Array.from(otpInputs).findIndex(i => i.value === "");
        if (firstEmpty === -1) otpInputs[otpInputs.length - 1].focus();
        else otpInputs[firstEmpty].focus();
      }
    });
  }
});

// Form submit: verify OTP
otpForm.addEventListener("submit", async (e) => {
  e.preventDefault();
  const otp = getEnteredOtp();
  const email = emailInput.value.trim();

  if (otp.length < otpInputs.length) {
    message.style.color = "red";
    message.textContent = `Please enter the complete ${otpInputs.length}-digit OTP.`;
    return;
  }

  try {
    const resp = await fetch("http://localhost:5001/verify-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, otp })
    });
    const data = await resp.json();

    if (data.verified) {
      message.style.color = "green";
      message.textContent = "✅ OTP Verified!";
      toggleOtpInputs(false);
    } else {
      message.style.color = "red";
      message.textContent = data.error || "Invalid OTP. Try again.";
      clearOtpInputs();
    }
  } catch (err) {
    console.error(err);
    message.style.color = "red";
    message.textContent = "Server error, please try again.";
  }
});

// Resend OTP handler
resendLink.addEventListener("click", async (e) => {
  e.preventDefault();
  const email = emailInput.value.trim();
  if (!email) {
    message.style.color = "red";
    message.textContent = "Enter your email to resend OTP.";
    return;
  }

  try {
    const resp = await fetch("http://localhost:5001/resend-otp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email })
    });
    const data = await resp.json();
    message.style.color = data.success ? "green" : "red";
    message.textContent = data.message || "Failed to resend OTP.";
    toggleOtpInputs(data.success);
  } catch (err) {
    console.error(err);
    message.style.color = "red";
    message.textContent = "Server error while resending OTP.";
  }
});
