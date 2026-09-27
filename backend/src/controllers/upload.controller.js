import fs from "fs";
import path from "path";
import crypto from "crypto";
import { uploadBufferToCloudinary, isCloudinaryConfigured } from "../lib/cloudinary.js";
async function uploadOrFallback(file, folder, req) {
    if (isCloudinaryConfigured()) {
        try {
            const result = await uploadBufferToCloudinary(file.buffer, folder);
            return { url: result.secure_url, publicId: result.public_id };
        }
        catch (cloudErr) {
            console.warn("⚠️ Cloudinary upload failed (e.g. missing 'create' permissions), falling back to local storage:", cloudErr?.message || cloudErr);
        }
    }
    // Local storage fallback
    const uploadsDir = path.resolve(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    const ext = path.extname(file.originalname || "") || ".jpg";
    const filename = `${crypto.randomUUID()}${ext}`;
    const filepath = path.join(uploadsDir, filename);
    fs.writeFileSync(filepath, file.buffer);
    const protocol = req.headers["x-forwarded-proto"] || req.protocol || "http";
    const host = req.get("host") || "localhost:5001";
    const localUrl = `${protocol}://${host}/uploads/${filename}`;
    return { url: localUrl, publicId: filename };
}
export class UploadController {
    static async uploadSingle(req, res, next) {
        try {
            const file = req.file;
            const folder = req.body.folder || "nearmeet/photos";
            if (!file) {
                res.status(400).json({
                    success: false,
                    message: "No image file provided. Please attach an image under the key 'photo'.",
                });
                return;
            }
            const result = await uploadOrFallback(file, folder, req);
            res.status(200).json({
                success: true,
                message: "Photo uploaded successfully",
                url: result.url,
                publicId: result.publicId,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async uploadMultiple(req, res, next) {
        try {
            const files = req.files;
            const folder = req.body.folder || "nearmeet/photos";
            if (!files || files.length === 0) {
                res.status(400).json({
                    success: false,
                    message: "No files uploaded. Please attach images under the key 'photos'.",
                });
                return;
            }
            const uploadPromises = files.map((file) => uploadOrFallback(file, folder, req));
            const results = await Promise.all(uploadPromises);
            const urls = results.map((r) => r.url);
            res.status(200).json({
                success: true,
                message: `Successfully uploaded ${urls.length} photo(s)`,
                urls,
                results,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
