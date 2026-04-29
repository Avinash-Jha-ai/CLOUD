import nodemailer from "nodemailer";
import { config } from "../configs/config.js";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,      // STARTTLS — more reliable from cloud hosts (Render blocks port 465)
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false  // avoids cert issues on some cloud environments
  }
});

// Verify SMTP connection on startup to catch bad credentials early
transporter.verify((error) => {
  if (error) {
    console.error("[gmail.service] SMTP connection FAILED:", error.message);
    console.error("[gmail.service] Check EMAIL_USER and EMAIL_PASS in .env");
  } else {
    console.log("[gmail.service] SMTP connection verified ✓");
  }
});

export const sendEmail = async (to, subject, html) => {
  try {
    const info = await transporter.sendMail({
      from: `"Cloudavi" <${config.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    console.log(`[gmail.service] Email sent to ${to} | messageId: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`[gmail.service] Failed to send email to ${to}:`, error.message);
    throw new Error(`Email delivery failed: ${error.message}`);
  }
};