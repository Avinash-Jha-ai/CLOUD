import express from "express";
import { upgradePlan, getPlanInfo } from "../controllers/plan.controller.js";
import { authenticateUserByEmail } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/upgrade", authenticateUserByEmail, upgradePlan);
router.get("/info", authenticateUserByEmail, getPlanInfo);


export default router;
