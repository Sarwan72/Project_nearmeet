import { Router } from "express";
import { UploadController } from "../controllers/upload.controller.js";
import { upload } from "../middleware/upload.middleware.js";
const router = Router();
router.post("/single", upload.single("photo"), UploadController.uploadSingle);
router.post("/photos", upload.array("photos", 10), UploadController.uploadMultiple);
export default router;
