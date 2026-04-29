import mongoose from "mongoose";

const fileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },

  fileName: {
    type: String,
    required: true,
  },

  fileType: {
    type: String,
    enum: ["image", "video", "document", "audio"],
    required: true,
  },

  size: {
    type: Number, 
  },

  url: {
    type: String,
    required: true,
  },

  public_id: {
    type: String, 
  },

  folder: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "folder",
    default: null,
  },

}, { timestamps: true });

const fileModel = mongoose.model("file", fileSchema);

export default fileModel;