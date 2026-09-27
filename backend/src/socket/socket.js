import { Server } from "socket.io";
import { config } from "../config/env.js";
import { ChatService } from "../services/chat.service.js";
import { BookingService } from "../services/booking.service.js";
export const onlineUsers = new Map(); // userId -> socketId
export const onlineVendors = new Map(); // vendorId -> socketId
export function setupSocketIO(server) {
    const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://near-meet.vercel.app",
        config.corsOrigin,
    ].filter(Boolean);
    const io = new Server(server, {
        cors: {
            origin: (origin, callback) => {
                if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
                    callback(null, true);
                }
                else {
                    callback(null, true); // Allow dev environments
                }
            },
            methods: ["GET", "POST"],
            credentials: true,
        },
    });
    io.on("connection", (socket) => {
        // Register user presence
        socket.on("registerUser", (userId) => {
            if (userId) {
                const key = userId.toString();
                onlineUsers.set(key, socket.id);
            }
        });
        // Register vendor presence
        socket.on("registerVendor", (vendorId) => {
            if (vendorId) {
                const key = vendorId.toString();
                onlineVendors.set(key, socket.id);
            }
        });
        // Disconnect event
        socket.on("disconnect", () => {
            for (const [userId, socketId] of onlineUsers) {
                if (socketId === socket.id) {
                    onlineUsers.delete(userId);
                    break;
                }
            }
            for (const [vendorId, socketId] of onlineVendors) {
                if (socketId === socket.id) {
                    onlineVendors.delete(vendorId);
                    break;
                }
            }
        });
        // Join vendor-user table / booking inquiry room
        socket.on("joinChat", ({ userId, vendorId }) => {
            if (userId && vendorId) {
                const uId = String(userId).trim();
                const vId = String(vendorId).trim();
                const room = `${uId}_${vId}`;
                socket.join(room);
            }
        });
        // Join direct conversation room (user-to-user matches)
        socket.on("joinConversation", (conversationId) => {
            if (conversationId) {
                socket.join(`conversation_${conversationId}`);
            }
        });
        // Vendor-User chat message (only allowed after payment confirmation)
        socket.on("sendMessage", async (data) => {
            const { userId, vendorId, sender, text } = data;
            if (!userId || !vendorId || !text?.trim())
                return;
            const uId = String(userId).trim();
            const vId = String(vendorId).trim();
            // Verify that this booking has been paid before broadcasting
            try {
                const eligibility = await BookingService.checkChatEligibility(uId, vId);
                if (!eligibility.canChat) {
                    socket.emit("chatBlocked", { message: eligibility.message });
                    return;
                }
            }
            catch (err) {
                console.error("Socket chat eligibility check error:", err);
            }
            // Persist message to PostgreSQL database
            let savedMsg = null;
            try {
                savedMsg = await BookingService.saveVendorUserMessage(vId, uId, sender, text.trim());
            }
            catch (dbErr) {
                console.error("Failed to persist vendor_user_message:", dbErr);
            }
            const room = `${uId}_${vId}`;
            const messagePayload = savedMsg || {
                sender,
                text: text.trim(),
                createdAt: new Date().toISOString(),
                userId: uId,
                vendorId: vId,
            };
            io.to(room).emit("receiveMessage", messagePayload);
        });
        // User-to-User direct chat message with PostgreSQL persistence
        socket.on("sendConversationMessage", async (data) => {
            try {
                const { conversationId, senderId, content, mediaUrl } = data;
                const savedMsg = await ChatService.saveMessage({
                    conversationId,
                    senderId,
                    content,
                    mediaUrl,
                    messageType: mediaUrl ? "image" : "text",
                });
                io.to(`conversation_${conversationId}`).emit("newConversationMessage", savedMsg);
            }
            catch (err) {
                console.error("Error persisting socket conversation message:", err);
            }
        });
    });
    return io;
}
