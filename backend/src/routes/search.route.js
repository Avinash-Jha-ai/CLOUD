import express from "express";
import { searchFilesAndFolders } from "../controllers/search.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", authenticateUser, searchFilesAndFolders);


export default router;
