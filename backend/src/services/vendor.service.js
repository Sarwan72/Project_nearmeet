import bcrypt from "bcryptjs";
import { query } from "../config/database.js";
import { ApiError } from "../middleware/error.middleware.js";
export class VendorService {
    /**
     * Get all active venues / hotels for public browsing
     */
    static async getAllVendors(filters) {
        let sql = `
      SELECT id, hotel_name, owner_email, phone, gst_no, business_type,
             location, price, opening_time, closing_time, description,
             average_rating, total_reviews, photos, amenities, created_at
      FROM vendors
      WHERE 1=1
    `;
        const params = [];
        if (filters?.businessType && filters.businessType !== "All") {
            params.push(filters.businessType);
            sql += ` AND business_type = $${params.length}`;
        }
        if (filters?.search) {
            params.push(`%${filters.search}%`);
            sql += ` AND (hotel_name ILIKE $${params.length} OR location ILIKE $${params.length} OR description ILIKE $${params.length})`;
        }
        sql += ` ORDER BY average_rating DESC, total_reviews DESC`;
        const res = await query(sql, params);
        return res.rows.map((v) => ({
            ...v,
            _id: v.id,
            hotelName: v.hotel_name,
            ownerEmail: v.owner_email,
            businessType: v.business_type,
            openingTime: v.opening_time,
            closingTime: v.closing_time,
            averageRating: Number(v.average_rating) || 0,
            totalReviews: Number(v.total_reviews) || 0,
        }));
    }
    /**
     * Get single vendor by ID with recent reviews
     */
    static async getVendorById(vendorId) {
        const res = await query(`SELECT id, hotel_name, owner_email, phone, gst_no, business_type,
              location, price, opening_time, closing_time, description,
              average_rating, total_reviews, photos, amenities, created_at
       FROM vendors
       WHERE id = $1`, [vendorId]);
        if (res.rows.length === 0) {
            throw new ApiError(404, "Vendor not found");
        }
        const vendor = res.rows[0];
        // Fetch reviews
        const reviewsRes = await query(`SELECT vr.id, vr.rating, vr.comment, vr.created_at,
              u.full_name AS user_name, up.avatar AS user_avatar
       FROM vendor_reviews vr
       INNER JOIN users u ON u.id = vr.user_id
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE vr.vendor_id = $1
       ORDER BY vr.created_at DESC`, [vendorId]);
        return {
            vendor: {
                ...vendor,
                _id: vendor.id,
                hotelName: vendor.hotel_name,
                ownerEmail: vendor.owner_email,
                businessType: vendor.business_type,
                openingTime: vendor.opening_time,
                closingTime: vendor.closing_time,
                averageRating: Number(vendor.average_rating) || 0,
                totalReviews: Number(vendor.total_reviews) || 0,
                reviews: reviewsRes.rows,
            },
        };
    }
    /**
     * Update vendor profile
     */
    static async updateVendor(vendorId, data) {
        const fields = [];
        const params = [];
        const fieldMap = {
            hotel_name: data.hotel_name ?? data.hotelName,
            phone: data.phone,
            gst_no: data.gst_no ?? data.gstNo,
            business_type: data.business_type ?? data.businessType,
            location: data.location,
            price: data.price !== undefined ? Number(data.price) : undefined,
            opening_time: data.opening_time ?? data.openingTime,
            closing_time: data.closing_time ?? data.closingTime,
            description: data.description,
            photos: data.photos,
            amenities: data.amenities,
        };
        for (const [col, val] of Object.entries(fieldMap)) {
            if (val !== undefined) {
                params.push(val);
                fields.push(`${col} = $${params.length}`);
            }
        }
        if (fields.length === 0) {
            const existing = await this.getVendorById(vendorId);
            return existing.vendor;
        }
        params.push(vendorId);
        const sql = `
      UPDATE vendors
      SET ${fields.join(", ")}, updated_at = NOW()
      WHERE id = $${params.length}
      RETURNING *
    `;
        const res = await query(sql, params);
        const vendor = res.rows[0];
        return {
            ...vendor,
            _id: vendor.id,
            hotelName: vendor.hotel_name,
            ownerEmail: vendor.owner_email,
            businessType: vendor.business_type,
            openingTime: vendor.opening_time,
            closingTime: vendor.closing_time,
            averageRating: Number(vendor.average_rating) || 0,
            totalReviews: Number(vendor.total_reviews) || 0,
        };
    }
    /**
     * Add a review for a vendor
     */
    static async addReview(userId, vendorId, rating, comment) {
        if (rating < 1 || rating > 5) {
            throw new ApiError(400, "Rating must be between 1 and 5");
        }
        const insertRes = await query(`INSERT INTO vendor_reviews (vendor_id, user_id, rating, comment)
       VALUES ($1, $2, $3, $4)
       RETURNING *`, [vendorId, userId, rating, comment || ""]);
        // Recalculate average rating & total reviews
        await query(`UPDATE vendors
       SET average_rating = (
         SELECT ROUND(AVG(rating)::numeric, 2) FROM vendor_reviews WHERE vendor_id = $1
       ),
       total_reviews = (
         SELECT COUNT(*) FROM vendor_reviews WHERE vendor_id = $1
       ),
       updated_at = NOW()
       WHERE id = $1`, [vendorId]);
        return insertRes.rows[0];
    }
    /**
     * Get vendor dashboard statistics
     */
    static async getDashboardStats(vendorId) {
        const statsRes = await query(`SELECT
        (SELECT COUNT(*) FROM booking_requests WHERE vendor_id = $1) AS total_bookings,
        (SELECT COUNT(*) FROM booking_requests WHERE vendor_id = $1 AND status = 'booked') AS accepted_bookings,
        (SELECT COUNT(*) FROM booking_requests WHERE vendor_id = $1 AND status = 'pending') AS pending_bookings,
        (SELECT COUNT(*) FROM booking_requests WHERE vendor_id = $1 AND status = 'paid') AS paid_bookings,
        (SELECT COUNT(*) FROM pair_requests WHERE vendor_id = $1) AS total_pairs`, [vendorId]);
        const stats = statsRes.rows[0];
        return {
            totalBookings: parseInt(stats.total_bookings, 10),
            acceptedBookings: parseInt(stats.accepted_bookings, 10),
            pendingBookings: parseInt(stats.pending_bookings, 10),
            paidBookings: parseInt(stats.paid_bookings, 10),
            totalPairs: parseInt(stats.total_pairs, 10),
        };
    }
    /**
     * Get public platform statistics for user home page dashboard
     */
    static async getPlatformStats() {
        const countsRes = await query(`SELECT
        (SELECT COUNT(*) FROM users WHERE role = 'USER') AS total_users,
        (SELECT COUNT(*) FROM vendors) AS total_vendors`);
        const citiesRes = await query(`SELECT DISTINCT location FROM vendors WHERE location IS NOT NULL`);
        const cities = citiesRes.rows.map((r) => r.location);
        const trendingUsersRes = await query(`SELECT u.id, u.full_name AS name, up.avatar, up.age, up.location AS city, up.bio
       FROM users u
       LEFT JOIN user_profiles up ON up.user_id = u.id
       WHERE u.role = 'USER' AND u.is_onboarded = TRUE
       LIMIT 10`);
        const featuredHotelsRes = await query(`SELECT id AS _id, id, hotel_name AS "hotelName", location, photos,
              average_rating AS "averageRating", total_reviews AS "totalReviews"
       FROM vendors
       ORDER BY average_rating DESC, total_reviews DESC
       LIMIT 10`);
        const counts = countsRes.rows[0];
        return {
            totalUsers: parseInt(counts?.total_users || "0", 10),
            totalVendors: parseInt(counts?.total_vendors || "0", 10),
            totalCities: cities.length,
            cities,
            trendingUsers: trendingUsersRes.rows,
            featuredHotels: featuredHotelsRes.rows.map((h) => ({
                ...h,
                averageRating: Number(h.averageRating) || 0,
                totalReviews: Number(h.totalReviews) || 0,
            })),
        };
    }
    /**
     * Change vendor password
     */
    static async changePassword(vendorId, currentPassword, newPassword) {
        const res = await query(`SELECT password_hash FROM vendors WHERE id = $1`, [vendorId]);
        if (res.rows.length === 0) {
            throw new ApiError(404, "Vendor not found");
        }
        const isMatch = await bcrypt.compare(currentPassword, res.rows[0].password_hash);
        if (!isMatch) {
            throw new ApiError(400, "Current password is incorrect");
        }
        const newHash = await bcrypt.hash(newPassword, 10);
        await query(`UPDATE vendors SET password_hash = $1, updated_at = NOW() WHERE id = $2`, [
            newHash,
            vendorId,
        ]);
        return { success: true, message: "Password updated successfully" };
    }
    /**
     * Delete vendor account
     */
    static async deleteAccount(vendorId, password) {
        const res = await query(`SELECT password_hash FROM vendors WHERE id = $1`, [vendorId]);
        if (res.rows.length === 0) {
            throw new ApiError(404, "Vendor not found");
        }
        const isMatch = await bcrypt.compare(password, res.rows[0].password_hash);
        if (!isMatch) {
            throw new ApiError(400, "Incorrect password");
        }
        await query(`DELETE FROM vendors WHERE id = $1`, [vendorId]);
        return { success: true, message: "Account deleted successfully" };
    }
}
