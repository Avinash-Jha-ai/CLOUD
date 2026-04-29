import { Router } from "express";
import { authenticateUserByEmail } from "../middlewares/auth.middleware.js";
import { createOrder, verifyPayment, getKey } from "../controllers/payment.controller.js";

const router = Router();

router.get("/get-key", authenticateUserByEmail, getKey);
router.post("/create-order", authenticateUserByEmail, createOrder);
router.post("/verify-payment", authenticateUserByEmail, verifyPayment);

export default router;
