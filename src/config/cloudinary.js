import { v2 as cloudinary } from "cloudinary";
import ENV from "../utils/env.js";

cloudinary.config({
  cloud_name: ENV.cloudinary.name,
  api_key: ENV.cloudinary.api_key,
  api_secret: ENV.cloudinary.secret_key,
});

export const connectCloudinary = async () => {
  try {
    await cloudinary.api.ping();
    console.log("Cloudinary connected");
  } catch (error) {
    console.error("Cloudinary connection failed:", error.message);
    process.exit(1);
  }
};

export default cloudinary;
