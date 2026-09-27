import { Router } from "express";
import { ChatController } from "../controllers/chat.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = Router();
router.get("/conversations", protectRoute, ChatController.getConversations);
router.post("/conversations/direct", protectRoute, ChatController.getOrCreateDirect);
router.get("/conversations/:conversationId/messages", protectRoute, ChatController.getMessages);
router.post("/conversations/:conversationId/messages", protectRoute, ChatController.sendMessage);
export default router;
