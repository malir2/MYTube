import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUD_NAME,
  api_key: process.env.API_KEY,
  api_secret: process.env.API_SECRET,
});

const fieUpload = async (localFilePath) => {
  try {
    if (localFilePath) {
      const response = await cloudinary.uploader.upload(localFilePath, {
        resource_type: "auto",
      });
      return console.log(response, ": File is uploaded successfully.");
    } else {
      return null;
    }
  } catch (error) {
    fs.unlinkSync(localFilePath);
    return null;
  }
};

export default cloudinary;
