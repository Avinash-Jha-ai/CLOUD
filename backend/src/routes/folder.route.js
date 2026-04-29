import {authenticateUserByEmail} from "../middlewares/auth.middleware.js"
import { createFolder ,createFolderInFolder,getFolderContent,deleteFolder} from "../controllers/folder.controller.js";
import { Router } from "express";


const router=Router();

router.post("/folder", authenticateUserByEmail, createFolder);


router.post("/folder/:folderId", authenticateUserByEmail, createFolderInFolder);

router.get("/folder/:folderId", authenticateUserByEmail, getFolderContent);

router.delete("/folder/:folderId", authenticateUserByEmail, deleteFolder);

export default router