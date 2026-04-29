import Razorpay from "razorpay";
import { config } from "../configs/config.js";

const razorpay = new Razorpay({
  key_id: config.RAZORPAY_KEY_ID,
  key_secret: config.RAZORPAY_KEY_SECRET,
});

export const createRazorpayOrder = async (options) => {
  return await razorpay.orders.create(options);
};

export const verifyRazorpaySignature = (body, signature) => {
  const crypto = import("crypto"); 
  return razorpay;
};

export default razorpay;
