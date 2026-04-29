import { Router } from "express";
import { logout, getMe, socialLogin } from "../controllers/auth.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router =Router();

/**
 * social login (Google)
 */
router.post("/social-login", socialLogin)

/**
 * get-me
 */
router.get("/me", authenticateUser, getMe)

/**
 * logout
 */
router.get("/logout", authenticateUser, logout);

export default router