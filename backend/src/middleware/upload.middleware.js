import multer from "multer";
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
    const allowedMimeTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/webp",
        "image/gif",
        "image/avif",
    ];
    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    }
    else {
        cb(new Error(`Invalid file format: ${file.mimetype}. Only JPEG, PNG, WEBP, GIF, and AVIF are allowed.`));
    }
};
export const upload = multer({
    storage,
    limits: {
        fileSize: 8 * 1024 * 1024, // 8MB limit
    },
    fileFilter,
});
