import { Router } from "express";
import { DiscoveryController } from "../controllers/discovery.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = Router();
router.get("/feed", protectRoute, DiscoveryController.getFeed);
export default router;
