import { Router } from "express";
import { authenticateUser } from "../middlewares/auth.middleware.js";
import { createOrder, verifyPayment, getKey } from "../controllers/payment.controller.js";

const router = Router();

router.get("/get-key", authenticateUser, getKey);
router.post("/create-order", authenticateUser, createOrder);
router.post("/verify-payment", authenticateUser, verifyPayment);

export default router;
