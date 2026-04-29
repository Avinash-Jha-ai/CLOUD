import { v2 as cloudinary } from "cloudinary";
import {config} from "../configs/config.js"
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const uploadFile = async (file, folder) => {
  return new Promise((resolve, reject) => {
    cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "auto", 
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      }
    ).end(file.buffer);
  });
};

export const deleteFile = async (public_id, resourceType = "image") => {
  return await cloudinary.uploader.destroy(public_id, {
    resource_type: resourceType,
  });
};