import dotenv from "dotenv";

dotenv.config();

if (!process.env.MONGO_URI) throw new Error("MONGO_URI is not defined");
if (!process.env.JWT_SECRET) throw new Error("JWT_SECRET is not defined");

if (!process.env.CLOUDINARY_CLOUD_NAME) throw new Error("CLOUDINARY_CLOUD_NAME is not defined");
if (!process.env.CLOUDINARY_API_KEY) throw new Error("CLOUDINARY_API_KEY is not defined");
if (!process.env.CLOUDINARY_API_SECRET) throw new Error("CLOUDINARY_API_SECRET is not defined");



export const config = {
  MONGO_URI: process.env.MONGO_URI,
  JWT_SECRET: process.env.JWT_SECRET?.trim(),

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,

  RAZORPAY_KEY_ID: process.env.RAZORPAY_KEY_ID?.trim() || "",
  RAZORPAY_KEY_SECRET: process.env.RAZORPAY_KEY_SECRET?.trim() || "",

  EMAIL_USER: process.env.EMAIL_USER?.trim(),
  EMAIL_PASS: process.env.EMAIL_PASS?.trim(),

  FRONTEND_URL: process.env.FRONTEND_URL || "http://localhost:5173",
};