import userModel from "../models/user.model.js";

export const storageExeed = async (user, files) => {
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  if (user.storageUsed + totalSize > user.storageLimit) {
    throw new Error("Storage limit exceeded. Upgrade your plan.");
  }

  user.storageUsed += totalSize;
  await user.save();
};


