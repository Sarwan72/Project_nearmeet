import { query } from "../config/database.js";
import { ApiError } from "../middleware/error.middleware.js";
export class BlockingService {
    static async blockUser(blockerId, blockedId, reason) {
        if (blockerId === blockedId) {
            throw new ApiError(400, "Cannot block yourself");
        }
        await query(`INSERT INTO blocked_users (blocker_id, blocked_id)
       VALUES ($1, $2)
       ON CONFLICT (blocker_id, blocked_id) DO NOTHING`, [blockerId, blockedId]);
        // Also remove any existing matches
        await query(`DELETE FROM matches
       WHERE (user1_id = $1 AND user2_id = $2)
          OR (user1_id = $2 AND user2_id = $1)`, [blockerId, blockedId]);
        return { success: true, message: "User blocked successfully" };
    }
    static async unblockUser(blockerId, blockedId) {
        await query(`DELETE FROM blocked_users
       WHERE blocker_id = $1 AND blocked_id = $2`, [blockerId, blockedId]);
        return { success: true, message: "User unblocked successfully" };
    }
    static async reportUser(reporterId, reportedUserId, reason, details = "") {
        if (reporterId === reportedUserId) {
            throw new ApiError(400, "Cannot report yourself");
        }
        const res = await query(`INSERT INTO reports (reporter_id, reported_user_id, reason, details)
       VALUES ($1, $2, $3, $4)
       RETURNING *`, [reporterId, reportedUserId, reason, details]);
        return res.rows[0];
    }
}
