import { UserService } from "../services/user.service.js";
import { BlockingService } from "../services/blocking.service.js";
export class UserController {
    static async getFullProfile(req, res, next) {
        try {
            const userId = req.user.id;
            const data = await UserService.getFullUserProfile(userId);
            res.status(200).json(data);
        }
        catch (err) {
            next(err);
        }
    }
    // Alias for getFullProfile
    static async getProfile(req, res, next) {
        return UserController.getFullProfile(req, res, next);
    }
    static async getUserById(req, res, next) {
        try {
            const userId = req.params.userId;
            const data = await UserService.getFullUserProfile(userId);
            res.status(200).json(data);
        }
        catch (err) {
            next(err);
        }
    }
    static async completeOnboarding(req, res, next) {
        try {
            const userId = req.user.id;
            await UserService.completeOnboarding(userId, req.body);
            const updated = await UserService.getFullUserProfile(userId);
            res.status(200).json(updated);
        }
        catch (err) {
            next(err);
        }
    }
    static async updateProfile(req, res, next) {
        try {
            const userId = req.user.id;
            await UserService.updateProfile(userId, req.body);
            const updated = await UserService.getFullUserProfile(userId);
            res.status(200).json(updated);
        }
        catch (err) {
            next(err);
        }
    }
    static async deleteAccount(req, res, next) {
        try {
            const userId = req.user.id;
            const { password } = req.body;
            const result = await UserService.deleteAccount(userId, password);
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    }
    static async getOnboardingOptions(_req, res, next) {
        try {
            const [interests, prompts] = await Promise.all([
                UserService.getAllInterests(),
                UserService.getAllPrompts(),
            ]);
            res.status(200).json({ success: true, interests, prompts });
        }
        catch (err) {
            next(err);
        }
    }
    static async addPhoto(req, res, next) {
        try {
            const userId = req.user.id;
            const { imageUrl } = req.body;
            const photo = await UserService.addPhoto(userId, imageUrl);
            res.status(201).json({ success: true, photo });
        }
        catch (err) {
            next(err);
        }
    }
    static async deletePhoto(req, res, next) {
        try {
            const userId = req.user.id;
            const id = req.params.id;
            await UserService.deletePhoto(userId, id);
            res.status(200).json({ success: true, message: "Photo removed" });
        }
        catch (err) {
            next(err);
        }
    }
    static async getInterests(_req, res, next) {
        try {
            const interests = await UserService.getAllInterests();
            res.status(200).json({ success: true, interests });
        }
        catch (err) {
            next(err);
        }
    }
    static async getPrompts(_req, res, next) {
        try {
            const prompts = await UserService.getAllPrompts();
            res.status(200).json({ success: true, prompts });
        }
        catch (err) {
            next(err);
        }
    }
    static async blockUser(req, res, next) {
        try {
            const blockerId = req.user.id;
            const { blockedId } = req.body;
            const result = await BlockingService.blockUser(blockerId, blockedId);
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    }
    static async reportUser(req, res, next) {
        try {
            const reporterId = req.user.id;
            const { reportedUserId, reason, details } = req.body;
            const report = await BlockingService.reportUser(reporterId, reportedUserId, reason, details);
            res.status(201).json({ success: true, report });
        }
        catch (err) {
            next(err);
        }
    }
}
