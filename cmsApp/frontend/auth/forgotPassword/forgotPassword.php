<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Blessed Saint John Memorial Gardens and Park</title>
  <link rel="stylesheet" href="forgotPassword.css" />
</head>
<body>
  <div class="content" style="justify-content: center;">
    <div class="right">
      <h2>Recover <span>your account</span></h2>
      <form id="recover-form">
        <div class="otp-choice">
          <label>
            <input type="radio" name="otp-method" value="phone" />
            Send OTP to Phone Number
          </label>
          <label>
            <input type="radio" name="otp-method" value="email" />
            Send OTP to Email
          </label>
        </div>

        <!-- Inputs initially hidden -->
        <input type="tel" id="phone-input" placeholder="Enter your Phone Number" style="display:none;" />
        <input type="email" id="email-input" placeholder="Enter your Email Address" style="display:none;" />

        <p class="member-text">We'll send a verification code to your selected contact method.</p>
        <p id="error-message" style="color:red; font-size:14px;"></p>
        <p id="success-message" style="color:green; font-size:14px;"></p>
        <button type="submit" class="create-account">Send OTP</button>
      </form>
    </div>
  </div>

  <script src="forgot-password.js"></script>
</body>
</html>
