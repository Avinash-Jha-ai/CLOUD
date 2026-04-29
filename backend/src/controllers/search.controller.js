import fileModel from "../models/file.model.js";
import folderModel from "../models/folder.model.js";

export const searchFilesAndFolders = async (req, res) => {
  try {
    const { query } = req.query;
    const userId = req.user._id;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: "Search query is required",
      });
    }

    const searchRegex = new RegExp(query, "i");

    const [files, folders] = await Promise.all([
      fileModel.find({
        user: userId,
        fileName: { $regex: searchRegex },
      }),
      folderModel.find({
        user: userId,
        name: { $regex: searchRegex },
      }),
    ]);

    return res.status(200).json({
      success: true,
      data: {
        files,
        folders,
      },
    });
  } catch (error) {
    console.error("Search Error:", error);
    return res.status(500).json({
      success: false,
      message: "An error occurred while searching",
    });
  }
};
