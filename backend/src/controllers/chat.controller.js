import { ChatService } from "../services/chat.service.js";
export class ChatController {
    static async getConversations(req, res, next) {
        try {
            const userId = req.user.id;
            const conversations = await ChatService.getUserConversations(userId);
            res.status(200).json({
                success: true,
                conversations,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getOrCreateDirect(req, res, next) {
        try {
            const userId = req.user.id;
            const { otherUserId } = req.body;
            if (!otherUserId) {
                res.status(400).json({ success: false, message: "otherUserId is required" });
                return;
            }
            const conversation = await ChatService.getOrCreateDirectConversation(userId, otherUserId);
            res.status(200).json({
                success: true,
                conversation,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getMessages(req, res, next) {
        try {
            const conversationId = req.params.conversationId;
            const limit = parseInt(req.query.limit, 10) || 50;
            const offset = parseInt(req.query.offset, 10) || 0;
            const messages = await ChatService.getConversationMessages(conversationId, limit, offset);
            res.status(200).json({
                success: true,
                messages,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async sendMessage(req, res, next) {
        try {
            const senderId = req.user.id;
            const conversationId = req.params.conversationId;
            const { content, messageType, mediaUrl } = req.body;
            if (!content && !mediaUrl) {
                res.status(400).json({ success: false, message: "Content or mediaUrl is required" });
                return;
            }
            const message = await ChatService.saveMessage({
                conversationId,
                senderId,
                content: content || "",
                messageType: messageType || "text",
                mediaUrl,
            });
            res.status(201).json({
                success: true,
                message,
            });
        }
        catch (error) {
            next(error);
        }
    }
}
