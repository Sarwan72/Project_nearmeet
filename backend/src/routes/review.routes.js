import { Router } from "express";
import { ReviewController } from "../controllers/review.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = Router();
router.get("/userdashboard/stats", ReviewController.getPlatformStats);
router.get("/vendor/:vendorId", ReviewController.getVendorReviews);
router.post("/vendor/:vendorId", protectRoute, ReviewController.addReview);
export default router;
