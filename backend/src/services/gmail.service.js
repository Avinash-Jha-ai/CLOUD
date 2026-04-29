import nodemailer from "nodemailer";
import { config } from "../configs/config.js";

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS,
  },
  connectionTimeout: 10000, // 10 seconds
  socketTimeout: 10000,     // 10 seconds
});

export const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `Avinash jha <${config.EMAIL_USER}>`, 
    to,
    subject,
    html, 
  });
};