import { Router } from "express";
import { NotificationController } from "../controllers/notification.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = Router();
// Retrieve notifications
router.get("/", protectRoute, NotificationController.getNotifications);
router.get("/:userId", protectRoute, NotificationController.getNotifications);
// Mark read
router.put("/read-all", protectRoute, NotificationController.markAllAsRead);
router.put("/:id/read", protectRoute, NotificationController.markAsRead);
export default router;
