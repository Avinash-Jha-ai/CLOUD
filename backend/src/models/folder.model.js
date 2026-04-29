import mongoose from "mongoose";

const folderSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },

  parent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "folder",
    default: null, 
  },
  color: {
    type: String,
    default: "#ef4444",
  },

}, { timestamps: true });

const folderModel = mongoose.models.folder || mongoose.model("folder", folderSchema);

export default folderModel;