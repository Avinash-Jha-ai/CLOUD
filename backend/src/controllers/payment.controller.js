import razorpay from "../services/payment.service.js";
import crypto from "crypto";
import { config } from "../configs/config.js";
import userModel from "../models/user.model.js";

const plans = {
  free: {
    amount: 1 * 100, // ₹1
    limit: 1 * 1024 * 1024 * 1024, // 1GB
  },
  pro: {
    amount: 50 * 100,
    limit: 2 * 1024 * 1024 * 1024,
  },
  premium: {
    amount: 100 * 100, // ₹100
    limit: 5 * 1024 * 1024 * 1024, // 5GB
  },
};

export const createOrder = async (req, res) => {
  try {
    const { plan } = req.body;

    if (!plan || !plans[plan]) {
      return res.status(400).json({ success: false, message: "Invalid plan selected" });
    }

    const options = {
      amount: plans[plan].amount,
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);
    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.error("Create Order Error:", error);
    return res.status(500).json({ success: false, message: "Could not create order" });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan } = req.body;

    const body = razorpay_order_id + "|" + razorpay_payment_id;
    const expectedSignature = crypto
      .createHmac("sha256", config.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest("hex");

    const isAuthentic = expectedSignature === razorpay_signature;

    if (isAuthentic) {
      const storageLimit = plans[plan].limit;
      const user = await userModel.findByIdAndUpdate(
        req.user.id,
        { plan, storageLimit },
        { new: true }
      ).select("-password");

      return res.status(200).json({
        success: true,
        message: "Payment verified and plan upgraded",
        user
      });
    } else {
      return res.status(400).json({ success: false, message: "Signature verification failed" });
    }
  } catch (error) {
    console.error("Verify Payment Error:", error);
    return res.status(500).json({ success: false, message: "Payment verification failed" });
  }
};

export const getKey = (req, res) => {
  return res.status(200).json({ key: config.RAZORPAY_KEY_ID });
};
