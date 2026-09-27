import { NotificationService } from "../services/notification.service.js";
export class NotificationController {
    static async getNotifications(req, res, next) {
        try {
            const userId = (req.params.userId || req.user?.id);
            const notifications = await NotificationService.getUserNotifications(userId);
            res.status(200).json({
                success: true,
                notifications,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async markAsRead(req, res, next) {
        try {
            const userId = req.user.id;
            const id = req.params.id;
            const updated = await NotificationService.markAsRead(id, userId);
            res.status(200).json({
                success: true,
                notification: updated,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async markAllAsRead(req, res, next) {
        try {
            const userId = req.user.id;
            await NotificationService.markAllAsRead(userId);
            res.status(200).json({
                success: true,
                message: "All notifications marked as read",
            });
        }
        catch (error) {
            next(error);
        }
    }
}
