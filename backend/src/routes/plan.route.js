import express from "express";
import { upgradePlan, getPlanInfo } from "../controllers/plan.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/upgrade", authenticateUser, upgradePlan);
router.get("/info", authenticateUser, getPlanInfo);


export default router;
