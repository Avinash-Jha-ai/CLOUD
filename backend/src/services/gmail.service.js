import nodemailer from "nodemailer";
import { config } from "../configs/config.js";

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: config.EMAIL_USER,
    pass: config.EMAIL_PASS,
  },
  connectionTimeout: 10000,
  socketTimeout: 10000,
});

export const sendEmail = async (to, subject, html) => {
  await transporter.sendMail({
    from: `Avinash jha <${config.EMAIL_USER}>`, 
    to,
    subject,
    html, 
  });
};