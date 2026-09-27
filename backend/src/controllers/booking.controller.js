import { BookingService } from "../services/booking.service.js";
import { query } from "../config/database.js";
export class BookingController {
    static async createBooking(req, res, next) {
        try {
            const userId = req.user.id;
            const { vendorId, tableName, guestCount, bookingDate } = req.body;
            const booking = await BookingService.createBooking(userId, vendorId, tableName, guestCount ? Number(guestCount) : 2, bookingDate);
            res.status(201).json({ success: true, booking });
        }
        catch (err) {
            next(err);
        }
    }
    static async getUserBookings(req, res, next) {
        try {
            const userId = (req.params.userId || req.user?.id);
            const bookings = await BookingService.getUserBookings(userId);
            res.status(200).json(bookings);
        }
        catch (err) {
            next(err);
        }
    }
    static async getVendorBookings(req, res, next) {
        try {
            const vendorId = (req.params.vendorId || req.vendor?.id);
            if (!vendorId) {
                res.status(400).json({ message: "Vendor ID required" });
                return;
            }
            const bookings = await BookingService.getVendorBookings(vendorId);
            res.status(200).json(bookings);
        }
        catch (err) {
            next(err);
        }
    }
    static async acceptBooking(req, res, next) {
        try {
            const vendorId = req.vendor.id;
            const id = req.params.id;
            const booking = await BookingService.acceptBooking(id, vendorId);
            res.status(200).json({ success: true, booking });
        }
        catch (err) {
            next(err);
        }
    }
    static async rejectBooking(req, res, next) {
        try {
            const vendorId = req.vendor.id;
            const id = req.params.id;
            const booking = await BookingService.rejectBooking(id, vendorId);
            res.status(200).json({ success: true, booking });
        }
        catch (err) {
            next(err);
        }
    }
    static async updateBookingStatus(req, res, next) {
        try {
            const vendorId = req.vendor.id;
            const id = req.params.id;
            const { status } = req.body;
            const booking = await BookingService.updateBookingStatus(id, vendorId, status);
            res.status(200).json({ success: true, booking });
        }
        catch (err) {
            next(err);
        }
    }
    static async markBookingAsPaid(req, res, next) {
        try {
            const id = req.params.id;
            const booking = await BookingService.markBookingAsPaid(id);
            res.status(200).json({ success: true, booking });
        }
        catch (err) {
            next(err);
        }
    }
    static async checkChatEligibility(req, res, next) {
        try {
            const userId = req.user.id;
            const vendorId = req.params.vendorId;
            const result = await BookingService.checkChatEligibility(userId, vendorId);
            res.status(200).json({ success: true, ...result });
        }
        catch (err) {
            next(err);
        }
    }
    static async checkVendorChatEligibility(req, res, next) {
        try {
            const vendorId = req.vendor.id;
            const userId = req.params.userId;
            const result = await BookingService.checkChatEligibility(userId, vendorId);
            res.status(200).json({ success: true, ...result });
        }
        catch (err) {
            next(err);
        }
    }
    static async getUserChatMessages(req, res, next) {
        try {
            const userId = req.user.id;
            const vendorId = req.params.vendorId;
            const messages = await BookingService.getVendorUserMessages(vendorId, userId);
            res.status(200).json({ success: true, messages });
        }
        catch (err) {
            next(err);
        }
    }
    static async getVendorChatMessages(req, res, next) {
        try {
            const vendorId = req.vendor.id;
            const userId = req.params.userId;
            const messages = await BookingService.getVendorUserMessages(vendorId, userId);
            res.status(200).json({ success: true, messages });
        }
        catch (err) {
            next(err);
        }
    }
    static async getPairableGuests(req, res, next) {
        try {
            const vendorId = (req.params.vendorId || req.vendor?.id);
            const guests = await BookingService.getPairableGuests(vendorId);
            res.status(200).json({ success: true, guests });
        }
        catch (err) {
            next(err);
        }
    }
    static async pairGuests(req, res, next) {
        try {
            const vendorId = req.vendor.id;
            let { user1Id, user2Id, bookingId1, bookingId2, tableNumber, note } = req.body;
            // If booking IDs were provided from dashboard selection, resolve the underlying user IDs
            if ((bookingId1 || bookingId2) && (!user1Id || !user2Id)) {
                if (bookingId1) {
                    const res1 = await query(`SELECT user_id FROM booking_requests WHERE id = $1`, [bookingId1]);
                    if (res1.rows.length > 0)
                        user1Id = res1.rows[0].user_id;
                }
                if (bookingId2) {
                    const res2 = await query(`SELECT user_id FROM booking_requests WHERE id = $1`, [bookingId2]);
                    if (res2.rows.length > 0)
                        user2Id = res2.rows[0].user_id;
                }
            }
            if (!user1Id || !user2Id) {
                res.status(400).json({ success: false, message: "Two valid guests or bookings are required for pairing" });
                return;
            }
            const pair = await BookingService.createPairRequest(vendorId, user1Id, user2Id, tableNumber || "T-Spark-01", note || "");
            res.status(201).json({
                success: true,
                message: "Guests paired successfully! Offline table reserved.",
                pairRequest: pair,
            });
        }
        catch (err) {
            next(err);
        }
    }
    static async getUserPairRequests(req, res, next) {
        try {
            const userId = req.user.id;
            const pairRequests = await BookingService.getUserPairRequests(userId);
            res.status(200).json({ success: true, pairRequests });
        }
        catch (err) {
            next(err);
        }
    }
    static async respondToPairRequest(req, res, next) {
        try {
            const userId = req.user.id;
            const id = req.params.id;
            const { action } = req.body; // "accept" | "reject"
            const updated = await BookingService.respondToPairRequest(id, userId, action);
            res.status(200).json({ success: true, pairRequest: updated });
        }
        catch (err) {
            next(err);
        }
    }
}
