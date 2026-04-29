import userModel from "../models/user.model.js";
import fileModel from "../models/file.model.js";

import { getFileType } from "../utils/fileType.js";
import { uploadFile, deleteFile as deleteFromCloudinary } from "../services/storage.service.js";
import { storageExeed } from "../utils/totalSize.js";


export const uploadMultipleFiles = async (req,res)=>{
    const files =req.files
    const {folderId} =req.params
    try{

    try {
      await storageExeed(req.user, files);
    } catch (err) {
      return res.status(400).json({
        message: err.message,
        success: false,
      });
    }


        const uploadedFiles = [];
        const { customNames } = req.body; 
        const namesArray = typeof customNames === 'string' ? JSON.parse(customNames) : customNames;

        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const fileType =getFileType(file.mimetype);
            const result = await uploadFile(file, `CLOUD/${req.user.id}/${fileType}`);
            
            const randomName = `file_${Math.random().toString(36).substring(2, 11)}`;
            const finalFileName = (namesArray && namesArray[i]) ? namesArray[i] : randomName;

            const newFile = await fileModel.create({
                user: req.user.id,
                fileName: finalFileName,
                fileType: fileType,
                size: file.size,
                url: result.secure_url,
                public_id: result.public_id,
                folder: (folderId === 'root' || !folderId) ? null : folderId,
            });
            uploadedFiles.push(newFile);
        }
        res.status(200).json({
        message: "Files uploaded successfully",
        count: uploadedFiles.length,
        files: uploadedFiles,
        storageUsed: req.user.storageUsed // Return updated storage
        });
    }catch (error) {
        console.log("upload error:", error);
        res.status(500).json({
        message: "Upload failed",
        });
    }
}

export const deletefile = async (req, res) => {
    const { fileId } = req.params;
    try {
        const file = await fileModel.findById(fileId);

        if (!file) {
            return res.status(404).json({
                message: "File not found",
                success: false,
            });
        }

        let updatedStorageUsed = 0;
        const user = await userModel.findById(req.user.id);
        if (user) {
            user.storageUsed -= (file.size || 0);
            if (user.storageUsed < 0) user.storageUsed = 0;
            await user.save();
            updatedStorageUsed = user.storageUsed;
        }

        if (file.public_id) {
            try {
                let resourceType = "image";
                if (file.fileType === "video" || file.fileType === "audio") resourceType = "video";
                if (file.fileType === "document") resourceType = "raw";
                
                await deleteFromCloudinary(file.public_id, resourceType);
            } catch (cloudErr) {
                console.log("Cloudinary error during delete:", cloudErr);
            }
        }

        await fileModel.findByIdAndDelete(fileId);

        return res.status(200).json({
            message: "File deleted successfully",
            success: true,
            fileId,
            storageUsed: updatedStorageUsed // Return updated storage
        });

    } catch (error) {
        console.log("Error in delete file:", error);
        return res.status(500).json({
            message: "Error in file delete",
            success: false,
            error: error.message
        });
    }
}