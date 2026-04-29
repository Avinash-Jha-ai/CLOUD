import { Router } from "express";
import { uploadMultipleFiles, deletefile as deleteFileController } from "../controllers/file.controller.js";
import { authenticateUserByEmail } from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/upload.middleware.js";

const router = Router();

router.post(
  "/upload/:folderId",
  authenticateUserByEmail,
  upload.array("files", 10),
  uploadMultipleFiles
);

router.delete(
  "/delete/:fileId",
  authenticateUserByEmail,
  deleteFileController
);

export default router;