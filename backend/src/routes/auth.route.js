import { Router } from "express";
import { logout, getMe, socialLogin } from "../controllers/auth.controller.js";
import { authenticateUserByEmail } from "../middlewares/auth.middleware.js";

const router =Router();

/**
 * social login (Google)
 */
router.post("/social-login", socialLogin)

/**
 * get-me
 */
router.get("/me", authenticateUserByEmail, getMe)

/**
 * logout
 */
router.get("/logout", authenticateUserByEmail, logout);

export default router