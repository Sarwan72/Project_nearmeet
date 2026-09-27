import { VendorService } from "../services/vendor.service.js";
export class ReviewController {
    static async addReview(req, res, next) {
        try {
            const userId = req.user?.id || req.body.userId;
            const vendorId = req.params.vendorId;
            const { rating, comment } = req.body;
            if (!userId) {
                res.status(401).json({ success: false, message: "User not authenticated" });
                return;
            }
            const review = await VendorService.addReview(userId, vendorId, Number(rating), comment);
            res.status(200).json({
                success: true,
                message: "Review submitted successfully",
                review,
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getVendorReviews(req, res, next) {
        try {
            const vendorId = req.params.vendorId;
            const data = await VendorService.getVendorById(vendorId);
            res.status(200).json({
                success: true,
                hotelName: data.vendor.hotel_name,
                averageRating: Number(data.vendor.averageRating ?? data.vendor.average_rating) || 0,
                totalReviews: Number(data.vendor.totalReviews ?? data.vendor.total_reviews) || 0,
                reviews: data.vendor.reviews || [],
            });
        }
        catch (error) {
            next(error);
        }
    }
    static async getPlatformStats(req, res, next) {
        try {
            const stats = await VendorService.getPlatformStats();
            res.status(200).json(stats);
        }
        catch (error) {
            next(error);
        }
    }
}
