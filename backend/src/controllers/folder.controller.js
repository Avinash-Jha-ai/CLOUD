import folderModel from "../models/folder.model.js";
import fileModel from "../models/file.model.js";
import { deleteFile } from "../services/storage.service.js";

export const createFolder =async (req,res)=>{
    const {name, color}=req.body;

    try{
        const folder = await folderModel.create({
            name,
            user: req.user.id,
            parent:null,
            color: color || "#ef4444",
        });
        
        res.status(200).json({
            message: "Folder created",
            success:true,
            folder,
        });
    }catch(error){
        console.log("error in create folder : ",error);
        return res.status(500).json({
            message:"error in create folder",
            success:false,
            error :error
        })
    }
}

export const createFolderInFolder = async (req, res) => {
  const { name } = req.body;
  const { folderId } = req.params;

  try {
    const parentFolder = await folderModel.findOne({
      _id: folderId,
      user: req.user.id,
    });

    if (!parentFolder) {
      return res.status(404).json({
        message: "Parent folder not found",
        success: false,
      });
    }

    const folder = await folderModel.create({
      name,
      user: req.user.id,
      parent: folderId,
      color: req.body.color || "#ef4444",
    });

    res.status(200).json({
      message: "Folder created inside folder",
      success: true,
      folder,
    });

  } catch (error) {
    console.log("error in create folder in folder : ", error);
    return res.status(500).json({
      message: "error in create folder in folder",
      success: false,
    });
  }
};

export const getFolderContent = async (req, res) => {
  const { folderId } = req.params;

  try {
    const queryId = folderId === 'root' ? null : folderId;

    const folders = await folderModel.find({
      parent: queryId,
      user: req.user.id
    });

    const files = await fileModel.find({
      folder: queryId,
      user: req.user.id
    });

    return res.status(200).json({
        message:"data fetch",
        success:true,
        folders,
        files
    })

  } catch (error) {
    console.log("Error fetching folder content:", error);
    return res.status(500).json({
        message: "Error fetching folder content",
        success: false,
        error: error.message
    });
  }
};

export const deleteFolder = async (req, res) => {
  const { folderId } = req.params;

  try {
    const folder = await folderModel.findOne({ _id: folderId, user: req.user.id });
    if (!folder) {
      return res.status(404).json({ message: "Folder not found or unauthorized", success: false });
    }

    const files = await fileModel.find({ folder: folderId });
    
    for (const file of files) {
      if (file.public_id) {
        try {
          let resourceType = "image";
          if (file.fileType === "video" || file.fileType === "audio") resourceType = "video";
          if (file.fileType === "document") resourceType = "raw";
          
          await deleteFile(file.public_id, resourceType);
        } catch (err) {
          console.log("Cloudinary err:", err);
        }
      }
      await fileModel.findByIdAndDelete(file._id);
    }

    await folderModel.findByIdAndDelete(folderId);

    return res.status(200).json({
      message: "folder deleted successfully",
      success: true,
      folderId
    });
  } catch (error) {
    console.log("error in delete folder : ", error);
    return res.status(500).json({
      message: "error in delete folder ",
      success: false,
      error: error.message
    })
  }
}