import { Router } from "express";
import { BookingController } from "../controllers/booking.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
import { protectVendorRoute } from "../middleware/vendor.middleware.js";
const router = Router();
// User creates booking
router.post("/book", protectRoute, BookingController.createBooking);
// User gets their bookings
router.get("/user/:userId", protectRoute, BookingController.getUserBookings);
router.get("/user-pair-requests", protectRoute, BookingController.getUserPairRequests);
// Vendor gets their bookings
router.get("/vendor/:vendorId", protectVendorRoute, BookingController.getVendorBookings);
// Vendor updates booking status
router.put("/:id/status", protectVendorRoute, BookingController.updateBookingStatus);
router.patch("/:id/status", protectVendorRoute, BookingController.updateBookingStatus);
router.post("/requests/:id/accept", protectVendorRoute, BookingController.acceptBooking);
router.post("/requests/:id/reject", protectVendorRoute, BookingController.rejectBooking);
// Vendor Matchmaking: Find guests who checked "open to meeting someone"
router.get("/vendor/:vendorId/pairable", protectVendorRoute, BookingController.getPairableGuests);
// Vendor Matchmaking: Vendor pairs two guests at a table
router.post("/vendor/pair", protectVendorRoute, BookingController.pairGuests);
router.post("/pair", protectVendorRoute, BookingController.pairGuests);
// User responds to pair request
router.post("/pair-requests/:id/respond", protectRoute, BookingController.respondToPairRequest);
// Booking payment confirmation
router.post("/:id/pay", protectRoute, BookingController.markBookingAsPaid);
// Chat eligibility verification (Requires status === 'paid')
router.get("/chat-eligibility/:vendorId", protectRoute, BookingController.checkChatEligibility);
router.get("/vendor-chat-eligibility/:userId", protectVendorRoute, BookingController.checkVendorChatEligibility);
// Chat message history (Persisted in PostgreSQL vendor_user_messages)
router.get("/user-chat-messages/:vendorId", protectRoute, BookingController.getUserChatMessages);
router.get("/vendor-chat-messages/:userId", protectVendorRoute, BookingController.getVendorChatMessages);
export default router;
