import { VendorService } from "../services/vendor.service.js";
import { BookingService } from "../services/booking.service.js";
export class VendorController {
    static async getHotels(req, res, next) {
        try {
            const { search, businessType, location } = req.query;
            const vendors = await VendorService.getAllVendors({ search, businessType, location });
            res.status(200).json(vendors);
        }
        catch (err) {
            next(err);
        }
    }
    static async getVendorById(req, res, next) {
        try {
            const id = (req.params.id || req.params.vendorId);
            const data = await VendorService.getVendorById(id);
            res.status(200).json(data);
        }
        catch (err) {
            next(err);
        }
    }
    static async getProfile(req, res, next) {
        try {
            const vendorId = req.vendor.id;
            const data = await VendorService.getVendorById(vendorId);
            res.status(200).json({ success: true, vendor: data.vendor });
        }
        catch (err) {
            next(err);
        }
    }
    static async updateProfile(req, res, next) {
        try {
            const vendorId = req.vendor.id;
            const updated = await VendorService.updateVendor(vendorId, req.body);
            res.status(200).json({ success: true, vendor: updated });
        }
        catch (err) {
            next(err);
        }
    }
    static async changePassword(req, res, next) {
        try {
            const vendorId = req.vendor.id;
            const { currentPassword, newPassword } = req.body;
            const result = await VendorService.changePassword(vendorId, currentPassword, newPassword);
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    }
    static async deleteAccount(req, res, next) {
        try {
            const vendorId = req.vendor.id;
            const { password } = req.body;
            const result = await VendorService.deleteAccount(vendorId, password);
            res.status(200).json(result);
        }
        catch (err) {
            next(err);
        }
    }
    static async addReview(req, res, next) {
        try {
            const userId = req.user.id;
            const vendorId = req.params.vendorId;
            const { rating, comment } = req.body;
            const review = await VendorService.addReview(userId, vendorId, Number(rating), comment);
            res.status(201).json({ success: true, review });
        }
        catch (err) {
            next(err);
        }
    }
    static async getDashboardStats(req, res, next) {
        try {
            const vendorId = req.vendor.id;
            const stats = await VendorService.getDashboardStats(vendorId);
            res.status(200).json({ success: true, stats });
        }
        catch (err) {
            next(err);
        }
    }
    // --- VENDOR TABLE MATCHMAKING (PAIR USERS) ---
    static async getPairableGuests(req, res, next) {
        try {
            const vendorId = req.vendor.id;
            const guests = await BookingService.getPairableGuests(vendorId);
            res.status(200).json({ success: true, guests });
        }
        catch (err) {
            next(err);
        }
    }
    static async createPairRequest(req, res, next) {
        try {
            const vendorId = req.vendor.id;
            const { user1Id, user2Id, tableNumber, note } = req.body;
            const pair = await BookingService.createPairRequest(vendorId, user1Id, user2Id, tableNumber, note);
            res.status(201).json({ success: true, pairRequest: pair });
        }
        catch (err) {
            next(err);
        }
    }
    static async getPairRequests(req, res, next) {
        try {
            const vendorId = req.vendor.id;
            const requests = await BookingService.getVendorPairRequests(vendorId);
            res.status(200).json({ success: true, pairRequests: requests });
        }
        catch (err) {
            next(err);
        }
    }
}
