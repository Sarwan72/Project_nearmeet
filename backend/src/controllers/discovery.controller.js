import { DiscoveryService } from "../services/discovery.service.js";
export class DiscoveryController {
    static async getDiscoveryUsers(req, res, next) {
        try {
            const userId = req.user.id;
            const users = await DiscoveryService.getDiscoveryUsers(userId);
            res.status(200).json({ success: true, users });
        }
        catch (err) {
            next(err);
        }
    }
    // Alias for getDiscoveryUsers
    static async getFeed(req, res, next) {
        return DiscoveryController.getDiscoveryUsers(req, res, next);
    }
}
