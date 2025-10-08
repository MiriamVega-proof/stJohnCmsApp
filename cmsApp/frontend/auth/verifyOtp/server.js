import express from "express";
import cors from "cors";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env.local from otp-service folder
dotenv.config({ path: path.join(__dirname, "../../../../otp-service/.env.local") });

// Debug: confirm credentials are loaded
console.log("Loaded MAILTRAP_USER:", process.env.MAILTRAP_USER);
console.log("Loaded MAILTRAP_PASS:", process.env.MAILTRAP_PASS ? "****" : "MISSING");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;
const OTP_SIZE = Number(process.env.OTP_SIZE) || 6;
const OTP_VALIDITY_PERIOD_MINUTES = Number(process.env.OTP_VALIDITY_PERIOD_MINUTES) || 2;

// In-memory OTP store: { email: { otp, expiresAt } }
const otpStore = {};

// Nodemailer transporter (Mailtrap)
const transporter = nodemailer.createTransport({
  host: "smtp.mailtrap.io",
  port: 2525,
  auth: {
    user: process.env.MAILTRAP_USER,
    pass: process.env.MAILTRAP_PASS
  }
});

// Generate numeric OTP
function generateOtp() {
  return Math.floor(
    Math.pow(10, OTP_SIZE - 1) + Math.random() * 9 * Math.pow(10, OTP_SIZE - 1)
  ).toString();
}

// Send OTP email
async function sendOtpEmail(email, otp) {
  const mailOptions = {
    from: `"OTP Service" <${process.env.MAILTRAP_USER}>`,
    to: email,
    subject: "Your OTP Code",
    text: `Your OTP is ${otp}. It expires in ${OTP_VALIDITY_PERIOD_MINUTES} minutes.`
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}: ${otp}`);
  } catch (err) {
    console.error("Error sending OTP:", err);
    throw err;
  }
}

// Request OTP
app.post("/send-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const otp = generateOtp();
    otpStore[email] = {
      otp,
      expiresAt: Date.now() + OTP_VALIDITY_PERIOD_MINUTES * 60 * 1000
    };

    await sendOtpEmail(email, otp);
    res.json({ success: true, message: "OTP sent" });
  } catch (err) {
    res.status(500).json({ error: "Failed to send OTP" });
  }
});

// Verify OTP
app.post("/verify-otp", (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp)
      return res.status(400).json({ error: "Email and OTP are required" });

    const record = otpStore[email];
    if (!record || record.expiresAt < Date.now())
      return res.status(400).json({ verified: false, error: "OTP expired or not found" });

    if (record.otp !== otp)
      return res.status(400).json({ verified: false, error: "Invalid OTP" });

    delete otpStore[email]; // prevent reuse
    res.json({ verified: true });
  } catch (err) {
    res.status(500).json({ error: "Internal server error" });
  }
});

// Resend OTP
app.post("/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: "Email is required" });

    const otp = generateOtp();
    otpStore[email] = {
      otp,
      expiresAt: Date.now() + OTP_VALIDITY_PERIOD_MINUTES * 60 * 1000
    };

    await sendOtpEmail(email, otp);
    res.json({ success: true, message: "OTP resent" });
  } catch (err) {
    res.status(500).json({ error: "Failed to resend OTP" });
  }
});

app.listen(PORT, () => console.log(`✅ Email OTP server running on port ${PORT}`));
