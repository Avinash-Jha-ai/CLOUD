import {authenticateUser} from "../middlewares/auth.middleware.js"
import { createFolder ,createFolderInFolder,getFolderContent,deleteFolder} from "../controllers/folder.controller.js";
import { Router } from "express";


const router=Router();

router.post("/folder", authenticateUser, createFolder);


router.post("/folder/:folderId", authenticateUser, createFolderInFolder);

router.get("/folder/:folderId", authenticateUser, getFolderContent);

router.delete("/folder/:folderId", authenticateUser, deleteFolder);

export default router