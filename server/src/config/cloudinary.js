import { v2 as cloudinary } from "cloudinary";
import "dotenv/config";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

console.log(
  "Cloudinary Configured:",
  cloudinary.config()?.cloud_name ? "OK" : "Failed/Check Env Vars"
);

export default cloudinary;