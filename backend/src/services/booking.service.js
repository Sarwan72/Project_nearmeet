import { query, withTransaction } from "../config/database.js";
import { ApiError } from "../middleware/error.middleware.js";
export class BookingService {
    /**
     * User creates a booking request at a vendor
     */
    static async createBooking(userId, vendorId, tableName = "Standard Table", guestCount = 2, bookingDate) {
        // Check if vendor exists
        const vendorCheck = await query(`SELECT id, hotel_name FROM vendors WHERE id = $1`, [vendorId]);
        if (vendorCheck.rows.length === 0) {
            throw new ApiError(404, "Venue not found");
        }
        const insertRes = await query(`INSERT INTO booking_requests (
        user_id, vendor_id, status, table_name, guest_count, booking_date
      ) VALUES ($1, $2, 'pending', $3, $4, $5)
      RETURNING *`, [
            userId,
            vendorId,
            tableName,
            guestCount,
            bookingDate ? new Date(bookingDate) : new Date(),
        ]);
        const booking = insertRes.rows[0];
        // Create a notification for the vendor
        await query(`INSERT INTO notifications (user_id, vendor_id, type, message)
       VALUES ($1, $2, 'newBooking', $3)`, [
            userId,
            vendorId,
            `New booking request for ${guestCount} guest(s) at table "${tableName}".`,
        ]);
        return {
            ...booking,
            _id: booking.id,
        };
    }
    /**
     * Fetch all bookings for a user
     */
    static async getUserBookings(userId) {
        const res = await query(`SELECT b.*, v.hotel_name AS vendor_name, v.location AS vendor_location,
              v.photos AS vendor_photos
       FROM booking_requests b
       INNER JOIN vendors v ON v.id = b.vendor_id
       WHERE b.user_id = $1
       ORDER BY b.created_at DESC`, [userId]);
        return res.rows.map((b) => ({
            ...b,
            _id: b.id,
            vendor: {
                _id: b.vendor_id,
                id: b.vendor_id,
                hotelName: b.vendor_name,
                location: b.vendor_location,
                photos: b.vendor_photos,
            },
        }));
    }
    /**
     * Fetch all bookings for a vendor
     */
    static async getVendorBookings(vendorId) {
        const res = await query(`SELECT b.*,
              u.full_name AS user_name, u.email AS user_email,
              up.avatar AS user_avatar, up.age AS user_age,
              up.gender AS user_gender, up.bio AS user_bio,
              up.location AS user_location, up.occupation AS user_occupation,
              pref.dating_intention, pref.relationship_values,
              COALESCE(
                (SELECT ARRAY_AGG(i.name)
                 FROM user_interests ui
                 JOIN interests i ON i.id = ui.interest_id
                 WHERE ui.user_id = u.id),
                '{}'
              ) AS user_interests
       FROM booking_requests b
       INNER JOIN users u ON u.id = b.user_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       LEFT JOIN user_preferences pref ON pref.user_id = u.id
       WHERE b.vendor_id = $1
       ORDER BY b.created_at DESC`, [vendorId]);
        return res.rows.map((row) => ({
            ...row,
            _id: row.id,
            pairStatus: row.paired_with_user_id ? "paired" : "single",
            user: {
                id: row.user_id,
                fullName: row.user_name,
                email: row.user_email,
                avatar: row.user_avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${row.user_id}`,
                profilePic: row.user_avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${row.user_id}`,
                age: row.user_age,
                gender: row.user_gender,
                bio: row.user_bio,
                location: row.user_location,
                occupation: row.user_occupation,
                datingIntention: row.dating_intention,
                relationshipValues: row.relationship_values || [],
                interests: row.user_interests || [],
            },
        }));
    }
    /**
     * Vendor accepts a booking
     */
    static async acceptBooking(bookingId, vendorId) {
        const res = await query(`UPDATE booking_requests
       SET status = 'booked', updated_at = NOW()
       WHERE id = $1 AND vendor_id = $2
       RETURNING *`, [bookingId, vendorId]);
        if (res.rows.length === 0) {
            throw new ApiError(404, "Booking request not found");
        }
        const booking = res.rows[0];
        // Notify user
        await query(`INSERT INTO notifications (user_id, vendor_id, type, message)
       VALUES ($1, $2, 'accepted', 'Your reservation request was accepted by the venue! 🎉')`, [booking.user_id, vendorId]);
        return booking;
    }
    /**
     * Vendor rejects a booking
     */
    static async rejectBooking(bookingId, vendorId) {
        const res = await query(`UPDATE booking_requests
       SET status = 'rejected', updated_at = NOW()
       WHERE id = $1 AND vendor_id = $2
       RETURNING *`, [bookingId, vendorId]);
        if (res.rows.length === 0) {
            throw new ApiError(404, "Booking request not found");
        }
        const booking = res.rows[0];
        // Notify user
        await query(`INSERT INTO notifications (user_id, vendor_id, type, message)
       VALUES ($1, $2, 'rejected', 'Your reservation request could not be accommodated at this time.')`, [booking.user_id, vendorId]);
        return booking;
    }
    /**
     * Update booking status generically
     */
    static async updateBookingStatus(bookingId, vendorId, status) {
        const validStatuses = ["pending", "booked", "rejected", "cancelled", "paid"];
        const finalStatus = validStatuses.includes(status)
            ? status
            : status === "accepted"
                ? "booked"
                : "rejected";
        const res = await query(`UPDATE booking_requests
       SET status = $1, updated_at = NOW()
       WHERE id = $2 AND vendor_id = $3
       RETURNING *`, [finalStatus, bookingId, vendorId]);
        if (res.rows.length === 0) {
            throw new ApiError(404, "Booking request not found");
        }
        return res.rows[0];
    }
    /**
     * User or system confirms payment for a booking
     * Transitions status to 'paid' and unlocks chat with vendor
     */
    static async markBookingAsPaid(bookingId) {
        const res = await query(`UPDATE booking_requests
       SET status = 'paid', updated_at = NOW()
       WHERE id = $1
       RETURNING *`, [bookingId]);
        if (res.rows.length === 0) {
            throw new ApiError(404, "Booking request not found");
        }
        const booking = res.rows[0];
        // Notify vendor that payment is confirmed and chat is unlocked
        await query(`INSERT INTO notifications (user_id, vendor_id, type, message)
       VALUES ($1, $2, 'paid', 'User completed payment for their booking! 💰 Chat is now unlocked.')`, [booking.user_id, booking.vendor_id]);
        return booking;
    }
    /**
     * Check if user and vendor have a paid booking to unlock chat
     */
    static async checkChatEligibility(userId, vendorId) {
        if (!userId || !vendorId) {
            return {
                canChat: false,
                status: "none",
                message: "Valid user and venue IDs are required.",
            };
        }
        try {
            const res = await query(`SELECT id, status, table_name, created_at
           FROM booking_requests
           WHERE user_id = $1::uuid AND vendor_id = $2::uuid
           ORDER BY CASE 
             WHEN status = 'paid' THEN 1 
             WHEN status = 'booked' THEN 2 
             WHEN status = 'pending' THEN 3 
             ELSE 4 
           END, created_at DESC
           LIMIT 1`, [String(userId).trim(), String(vendorId).trim()]);
            if (res.rows.length === 0) {
                return {
                    canChat: false,
                    status: "none",
                    message: "No booking found with this venue. Please book a table first.",
                };
            }
            const latest = res.rows[0];
            if (latest.status === "paid") {
                return {
                    canChat: true,
                    status: "paid",
                    bookingId: latest.id,
                    tableName: latest.table_name,
                    message: "Payment confirmed. You can now chat directly with the venue!",
                };
            }
            else if (latest.status === "booked") {
                return {
                    canChat: false,
                    status: "booked",
                    bookingId: latest.id,
                    tableName: latest.table_name,
                    message: "Your booking is confirmed by the venue! Please complete payment to unlock live chat.",
                };
            }
            else if (latest.status === "pending") {
                return {
                    canChat: false,
                    status: "pending",
                    bookingId: latest.id,
                    tableName: latest.table_name,
                    message: "Your booking request is pending venue confirmation.",
                };
            }
            else {
                return {
                    canChat: false,
                    status: latest.status,
                    bookingId: latest.id,
                    tableName: latest.table_name,
                    message: `Booking status is currently ${latest.status}.`,
                };
            }
        }
        catch (err) {
            console.error("Error in checkChatEligibility:", err);
            return {
                canChat: false,
                status: "none",
                message: "Unable to verify booking status.",
            };
        }
    }
    /**
     * Save a chat message between vendor and user into PostgreSQL
     */
    static async saveVendorUserMessage(vendorId, userId, sender, text) {
        if (!vendorId || !userId || !text?.trim()) return null;
        const res = await query(`INSERT INTO vendor_user_messages (vendor_id, user_id, sender, text)
       VALUES ($1::uuid, $2::uuid, $3, $4)
       RETURNING id, vendor_id, user_id, sender, text, created_at`, [String(vendorId).trim(), String(userId).trim(), sender, text.trim()]);
        const row = res.rows[0];
        return {
            id: row.id,
            vendorId: row.vendor_id,
            userId: row.user_id,
            sender: row.sender,
            text: row.text,
            createdAt: row.created_at,
        };
    }
    /**
     * Get all message history between a vendor and user
     */
    static async getVendorUserMessages(vendorId, userId) {
        if (!vendorId || !userId) return [];
        try {
            const res = await query(`SELECT id, vendor_id, user_id, sender, text, created_at
           FROM vendor_user_messages
           WHERE vendor_id = $1::uuid AND user_id = $2::uuid
           ORDER BY created_at ASC`, [String(vendorId).trim(), String(userId).trim()]);
            return res.rows.map((row) => ({
                id: row.id,
                vendorId: row.vendor_id,
                userId: row.user_id,
                sender: row.sender,
                text: row.text,
                createdAt: row.created_at,
            }));
        }
        catch (err) {
            console.error("Error in getVendorUserMessages:", err);
            return [];
        }
    }
    // ==========================================
    // VENDOR TABLE MATCHMAKING / PAIR USERS
    // ==========================================
    /**
     * Get all pairable guests at a venue
     */
    static async getPairableGuests(vendorId) {
        const res = await query(`SELECT DISTINCT ON (u.id)
              u.id, u.full_name, u.email,
              up.avatar, up.age, up.gender, up.location, up.bio,
              up.occupation, up.education, up.drinking, up.smoking,
              pref.dating_intention, pref.gender_preference,
              b.id AS booking_id, b.status AS booking_status,
              b.pair_status, b.table_name,
              COALESCE(
                (SELECT ARRAY_AGG(i.name)
                 FROM user_interests ui
                 JOIN interests i ON i.id = ui.interest_id
                 WHERE ui.user_id = u.id),
                '{}'
              ) AS interests
       FROM booking_requests b
       INNER JOIN users u ON u.id = b.user_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       LEFT JOIN user_preferences pref ON pref.user_id = u.id
       WHERE b.vendor_id = $1 AND b.status IN ('pending', 'booked', 'paid')
       ORDER BY u.id, b.created_at DESC`, [vendorId]);
        return res.rows.map((r) => ({
            id: r.id,
            fullName: r.full_name,
            email: r.email,
            avatar: r.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${r.id}`,
            age: r.age,
            gender: r.gender,
            location: r.location,
            bio: r.bio,
            occupation: r.occupation,
            datingIntention: r.dating_intention,
            lifestyle: {
                drinking: r.drinking,
                smoking: r.smoking,
            },
            interests: r.interests || [],
            bookingId: r.booking_id,
            bookingStatus: r.booking_status,
            pairStatus: r.pair_status,
            tableName: r.table_name,
        }));
    }
    /**
     * Vendor pairs two compatible users at a designated table
     */
    static async createPairRequest(vendorId, user1Id, user2Id, tableNumber, note = "") {
        if (user1Id === user2Id) {
            throw new ApiError(400, "Cannot pair a user with themselves");
        }
        return await withTransaction(async (client) => {
            // Calculate shared interests compatibility score
            const scoreRes = await client.query(`SELECT COUNT(*)
         FROM user_interests ui1
         INNER JOIN user_interests ui2 ON ui1.interest_id = ui2.interest_id
         WHERE ui1.user_id = $1 AND ui2.user_id = $2`, [user1Id, user2Id]);
            const sharedCount = parseInt(scoreRes.rows[0].count, 10);
            const compatibilityScore = Math.min(100, Math.max(55, 50 + sharedCount * 12));
            // Create pair request
            const pairRes = await client.query(`INSERT INTO pair_requests (
          vendor_id, user1_id, user2_id, table_number,
          compatibility_score, user1_status, user2_status, status, note
        ) VALUES ($1, $2, $3, $4, $5, 'pending', 'pending', 'pending', $6)
        RETURNING *`, [vendorId, user1Id, user2Id, tableNumber, compatibilityScore, note]);
            const pair = pairRes.rows[0];
            // Update bookings pair status
            await client.query(`UPDATE booking_requests
         SET pair_status = 'paired', paired_with_user_id = $1, table_name = $2
         WHERE vendor_id = $3 AND user_id = $4`, [user2Id, tableNumber, vendorId, user1Id]);
            await client.query(`UPDATE booking_requests
         SET pair_status = 'paired', paired_with_user_id = $1, table_name = $2
         WHERE vendor_id = $3 AND user_id = $4`, [user1Id, tableNumber, vendorId, user2Id]);
            // Notify both users
            const venueRes = await client.query(`SELECT hotel_name FROM vendors WHERE id = $1`, [vendorId]);
            const venueName = venueRes.rows[0]?.hotel_name || "The Venue";
            const notifMsg = `You have a table matchmaking request at ${venueName} (Table: ${tableNumber})!`;
            const notifMeta = JSON.stringify({ pairRequestId: pair.id, tableNumber });
            await client.query(`INSERT INTO notifications (user_id, vendor_id, type, message, metadata)
         VALUES
         ($1, $3, 'pairRequest', $4, $5),
         ($2, $3, 'pairRequest', $4, $5)`, [user1Id, user2Id, vendorId, notifMsg, notifMeta]);
            return pair;
        });
    }
    /**
     * Get pair requests for a vendor
     */
    static async getVendorPairRequests(vendorId) {
        const res = await query(`SELECT pr.*,
              u1.full_name AS user1_name, up1.avatar AS user1_avatar,
              u2.full_name AS user2_name, up2.avatar AS user2_avatar
       FROM pair_requests pr
       INNER JOIN users u1 ON u1.id = pr.user1_id
       LEFT JOIN user_profiles up1 ON up1.user_id = u1.id
       INNER JOIN users u2 ON u2.id = pr.user2_id
       LEFT JOIN user_profiles up2 ON up2.user_id = u2.id
       WHERE pr.vendor_id = $1
       ORDER BY pr.created_at DESC`, [vendorId]);
        return res.rows;
    }
    /**
     * Get pair requests for a user
     */
    static async getUserPairRequests(userId) {
        const res = await query(`SELECT pr.*,
              v.hotel_name AS vendor_name, v.location AS vendor_location,
              u1.full_name AS user1_name, up1.avatar AS user1_avatar,
              u2.full_name AS user2_name, up2.avatar AS user2_avatar
       FROM pair_requests pr
       INNER JOIN vendors v ON v.id = pr.vendor_id
       INNER JOIN users u1 ON u1.id = pr.user1_id
       LEFT JOIN user_profiles up1 ON up1.user_id = u1.id
       INNER JOIN users u2 ON u2.id = pr.user2_id
       LEFT JOIN user_profiles up2 ON up2.user_id = u2.id
       WHERE pr.user1_id = $1 OR pr.user2_id = $1
       ORDER BY pr.created_at DESC`, [userId]);
        return res.rows;
    }
    /**
     * User accepts or rejects a pair request
     */
    static async respondToPairRequest(pairRequestId, userId, action) {
        const pairRes = await query(`SELECT * FROM pair_requests WHERE id = $1 AND (user1_id = $2 OR user2_id = $2)`, [pairRequestId, userId]);
        if (pairRes.rows.length === 0) {
            throw new ApiError(404, "Pair request not found");
        }
        const pair = pairRes.rows[0];
        const isUser1 = pair.user1_id === userId;
        const newStatusVal = action === "accept" ? "accepted" : "rejected";
        const user1Status = isUser1 ? newStatusVal : pair.user1_status;
        const user2Status = !isUser1 ? newStatusVal : pair.user2_status;
        let overallStatus = "pending";
        if (user1Status === "rejected" || user2Status === "rejected") {
            overallStatus = "rejected";
        }
        else if (user1Status === "accepted" && user2Status === "accepted") {
            overallStatus = "accepted";
        }
        const updateRes = await query(`UPDATE pair_requests
       SET user1_status = $1, user2_status = $2, status = $3, updated_at = NOW()
       WHERE id = $4
       RETURNING *`, [user1Status, user2Status, overallStatus, pairRequestId]);
        // If both accepted, create an automatic mutual match!
        if (overallStatus === "accepted") {
            await query(`INSERT INTO matches (user1_id, user2_id, compatibility_score)
         VALUES ($1, $2, $3)
         ON CONFLICT (user1_id, user2_id) DO NOTHING`, [pair.user1_id, pair.user2_id, pair.compatibility_score]);
        }
        return updateRes.rows[0];
    }
}
