import { query } from "../config/database.js";
export class NotificationService {
    static async getUserNotifications(userId) {
        const res = await query(`SELECT * FROM notifications
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT 50`, [userId]);
        return res.rows;
    }
    static async getVendorNotifications(vendorId) {
        const res = await query(`SELECT n.*, u.full_name AS user_name, up.avatar AS user_avatar
       FROM notifications n
       LEFT JOIN users u ON u.id = n.user_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE n.vendor_id = $1
       ORDER BY n.created_at DESC
       LIMIT 50`, [vendorId]);
        return res.rows;
    }
    static async markAsRead(notificationId, userId) {
        const res = await query(`UPDATE notifications
       SET is_read = TRUE
       WHERE id = $1 AND (user_id = $2 OR vendor_id::text = $2)
       RETURNING *`, [notificationId, userId]);
        return res.rows[0];
    }
    static async markAllAsRead(userId) {
        await query(`UPDATE notifications
       SET is_read = TRUE
       WHERE user_id = $1`, [userId]);
        return { success: true };
    }
}
