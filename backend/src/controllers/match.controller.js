import { MatchService } from "../services/match.service.js";
import { BlockingService } from "../services/blocking.service.js";
export class MatchController {
    static async likeUser(req, res, next) {
        try {
            const currentUserId = req.user.id;
            const { targetUserId } = req.body;
            if (!targetUserId) {
                res.status(400).json({ success: false, message: "Target user ID is required" });
                return;
            }
            const match = await MatchService.likeUser(currentUserId, targetUserId);
            res.status(200).json({
                success: true,
                isMatch: !!match,
                match: match || null,
                message: match ? "It's a Match! 🎉" : "Liked user successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async passUser(req, res, next) {
        try {
            const currentUserId = req.user.id;
            const { targetUserId } = req.body;
            if (!targetUserId) {
                res.status(400).json({ success: false, message: "Target user ID is required" });
                return;
            }
            // Record pass if desired, or acknowledge
            res.status(200).json({
                success: true,
                message: "Passed user",
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getMatches(req, res, next) {
        try {
            const currentUserId = req.user.id;
            const matches = await MatchService.getUserMatches(currentUserId);
            res.status(200).json({
                success: true,
                matches,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async blockUser(req, res, next) {
        try {
            const currentUserId = req.user.id;
            const userId = req.params.userId;
            const { reason } = req.body;
            await BlockingService.blockUser(currentUserId, userId, reason);
            res.status(200).json({
                success: true,
                message: "User blocked successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async reportUser(req, res, next) {
        try {
            const currentUserId = req.user.id;
            const userId = req.params.userId;
            const { reason, details } = req.body;
            await BlockingService.reportUser(currentUserId, userId, reason, details);
            res.status(200).json({
                success: true,
                message: "Report submitted successfully",
            });
        }
        catch (error) {
            next(error);
        }
    }
}
