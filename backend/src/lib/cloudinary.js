import { v2 as cloudinary } from "cloudinary";
import { config } from "../config/env.js";
cloudinary.config({
    cloud_name: config.cloudinary.cloudName,
    api_key: config.cloudinary.apiKey,
    api_secret: config.cloudinary.apiSecret,
});
export const isCloudinaryConfigured = () => {
    return Boolean(config.cloudinary.cloudName &&
        config.cloudinary.apiKey &&
        config.cloudinary.apiSecret);
};
export const uploadBufferToCloudinary = (buffer, folder = "nearmeet/uploads") => {
    return new Promise((resolve, reject) => {
        if (!isCloudinaryConfigured()) {
            return reject(new Error("Cloudinary credentials missing in .env (CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET)"));
        }
        const uploadStream = cloudinary.uploader.upload_stream({
            folder,
            resource_type: "auto",
            transformation: [{ quality: "auto", fetch_format: "auto" }],
        }, (error, result) => {
            if (error || !result) {
                return reject(error || new Error("Failed to upload image to Cloudinary"));
            }
            resolve(result);
        });
        uploadStream.end(buffer);
    });
};
export default cloudinary;
