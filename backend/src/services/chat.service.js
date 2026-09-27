import { query, withTransaction } from "../config/database.js";
import { ApiError } from "../middleware/error.middleware.js";
export class ChatService {
    /**
     * Get or create a direct conversation between two members
     */
    static async getOrCreateDirectConversation(user1Id, user2Id) {
        if (user1Id === user2Id) {
            throw new ApiError(400, "Cannot start a conversation with yourself");
        }
        // Check if conversation between these two already exists
        const existingRes = await query(`SELECT cm1.conversation_id
       FROM conversation_members cm1
       INNER JOIN conversation_members cm2 ON cm1.conversation_id = cm2.conversation_id
       WHERE cm1.user_id = $1 AND cm2.user_id = $2
       LIMIT 1`, [user1Id, user2Id]);
        if (existingRes.rows.length > 0) {
            return existingRes.rows[0].conversation_id;
        }
        // Create new conversation
        return await withTransaction(async (client) => {
            const convRes = await client.query(`INSERT INTO conversations (type) VALUES ('direct') RETURNING id`);
            const convId = convRes.rows[0].id;
            await client.query(`INSERT INTO conversation_members (conversation_id, user_id)
         VALUES ($1, $2), ($1, $3)`, [convId, user1Id, user2Id]);
            return convId;
        });
    }
    /**
     * Get all conversations for a user
     */
    static async getUserConversations(userId) {
        const res = await query(`SELECT c.id, c.type, c.updated_at,
              u.id AS other_user_id, u.full_name AS other_user_name,
              up.avatar AS other_user_avatar,
              (
                SELECT text FROM messages m
                WHERE m.conversation_id = c.id
                ORDER BY m.created_at DESC LIMIT 1
              ) AS last_message_text,
              (
                SELECT created_at FROM messages m
                WHERE m.conversation_id = c.id
                ORDER BY m.created_at DESC LIMIT 1
              ) AS last_message_time,
              (
                SELECT COUNT(*) FROM messages m
                WHERE m.conversation_id = c.id AND m.sender_id != $1 AND m.is_read = FALSE
              ) AS unread_count
       FROM conversations c
       INNER JOIN conversation_members cm ON cm.conversation_id = c.id AND cm.user_id = $1
       INNER JOIN conversation_members cm_other ON cm_other.conversation_id = c.id AND cm_other.user_id != $1
       INNER JOIN users u ON u.id = cm_other.user_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       ORDER BY c.updated_at DESC`, [userId]);
        return res.rows;
    }
    /**
     * Get messages history for a conversation
     */
    static async getConversationMessages(conversationId, limit = 100, offset = 0) {
        const res = await query(`SELECT m.id, m.conversation_id, m.sender_id, m.text, m.is_read, m.created_at,
              u.full_name AS sender_name, up.avatar AS sender_avatar
       FROM messages m
       INNER JOIN users u ON u.id = m.sender_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE m.conversation_id = $1
       ORDER BY m.created_at ASC
       LIMIT $2 OFFSET $3`, [conversationId, limit, offset]);
        return res.rows;
    }
    /**
     * Save a message and update conversation timestamp
     */
    static async saveMessage(conversationIdOrPayload, senderIdParam, textParam) {
        let conversationId;
        let senderId;
        let text;
        if (typeof conversationIdOrPayload === "object") {
            conversationId = conversationIdOrPayload.conversationId;
            senderId = conversationIdOrPayload.senderId;
            text = conversationIdOrPayload.content || conversationIdOrPayload.text || conversationIdOrPayload.mediaUrl || "";
        }
        else {
            conversationId = conversationIdOrPayload;
            senderId = senderIdParam;
            text = textParam || "";
        }
        if (!text || !text.trim()) {
            throw new ApiError(400, "Message text cannot be empty");
        }
        return await withTransaction(async (client) => {
            const msgRes = await client.query(`INSERT INTO messages (conversation_id, sender_id, text, is_read)
         VALUES ($1, $2, $3, FALSE)
         RETURNING *`, [conversationId, senderId, text.trim()]);
            await client.query(`UPDATE conversations SET updated_at = NOW() WHERE id = $1`, [conversationId]);
            return msgRes.rows[0];
        });
    }
}
