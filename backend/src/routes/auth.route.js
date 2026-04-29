import { Router } from "express";
import {upload} from "../middlewares/upload.middleware.js"
import { register,login,logout,getMe,sentotp ,verifyEmail, socialLogin} from "../controllers/auth.controller.js";
import { upgradePlan } from "../controllers/plan.controller.js";
import { authenticateUser,authenticateUserByEmail } from "../middlewares/auth.middleware.js";
const router =Router();

/**
 * register
 */
router.post("/register",upload.single("file"),register);

/**
 * generate otp 
 */
router.get("/generateOtp",authenticateUser,sentotp);

/**
 * verify
 */
router.post("/verify",verifyEmail);

/**
 * login
 */
router.post("/login",login)

// /**
//  * google
//  */
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