import express from "express";
import { searchFilesAndFolders } from "../controllers/search.controller.js";
import { authenticateUserByEmail } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticateUserByEmail, searchFilesAndFolders);


export default router;
