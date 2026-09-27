import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/database.js";
import { config } from "../config/env.js";
import { ApiError } from "../middleware/error.middleware.js";
export class AuthService {
    static getCookieOptions(maxAgeDays = 7) {
        const isProd = config.isProduction || Boolean(process.env.RENDER);
        return {
            maxAge: maxAgeDays * 24 * 60 * 60 * 1000,
            httpOnly: true,
            secure: isProd,
            sameSite: isProd ? "none" : "lax",
            path: "/",
        };
    }
    static generateUserToken(userId) {
        return jwt.sign({ userId, role: "USER" }, config.jwtSecret, {
            expiresIn: "7d",
        });
    }
    static generateVendorToken(vendorId) {
        return jwt.sign({ id: vendorId, role: "vendor" }, config.vendorJwtSecret, {
            expiresIn: "7d",
        });
    }
    // --- USER AUTH ---
    static async registerUser(fullName, email, password) {
        if (!fullName || !email || !password) {
            throw new ApiError(400, "All fields are required");
        }
        if (password.length < 6) {
            throw new ApiError(400, "Password must be at least 6 characters");
        }
        const emailCheck = await query(`SELECT id FROM users WHERE email = $1`, [email.toLowerCase().trim()]);
        if (emailCheck.rows.length > 0) {
            throw new ApiError(400, "Email already exists, please use a different one");
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const userRes = await query(`INSERT INTO users (full_name, email, password_hash, role, is_onboarded)
       VALUES ($1, $2, $3, 'USER', FALSE)
       RETURNING id, full_name, email, role, is_onboarded, created_at, updated_at`, [fullName.trim(), email.toLowerCase().trim(), passwordHash]);
        const user = userRes.rows[0];
        // Seed default user profile with a clean default avatar
        const defaultAvatar = `https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(user.id)}`;
        await query(`INSERT INTO user_profiles (user_id, avatar)
       VALUES ($1, $2)
       ON CONFLICT (user_id) DO NOTHING`, [user.id, defaultAvatar]);
        // Seed default preferences
        await query(`INSERT INTO user_preferences (user_id)
       VALUES ($1)
       ON CONFLICT (user_id) DO NOTHING`, [user.id]);
        const token = this.generateUserToken(user.id);
        return {
            user: {
                ...user,
                _id: user.id,
                fullName: user.full_name,
                isOnboarded: Boolean(user.is_onboarded),
            },
            token,
        };
    }
    static async loginUser(email, password) {
        if (!email || !password) {
            throw new ApiError(400, "Email and password are required");
        }
        const res = await query(`SELECT id, full_name, email, password_hash, role, is_onboarded, created_at, updated_at
       FROM users
       WHERE email = $1`, [email.toLowerCase().trim()]);
        if (res.rows.length === 0) {
            throw new ApiError(401, "Invalid email or password");
        }
        const userRecord = res.rows[0];
        const isCorrect = await bcrypt.compare(password, userRecord.password_hash);
        if (!isCorrect) {
            throw new ApiError(401, "Invalid email or password");
        }
        // Fetch avatar from profile if available
        const profileRes = await query(`SELECT avatar FROM user_profiles WHERE user_id = $1`, [userRecord.id]);
        const { password_hash, ...safeUser } = userRecord;
        const user = {
            ...safeUser,
            _id: safeUser.id,
            fullName: safeUser.full_name,
            isOnboarded: Boolean(safeUser.is_onboarded),
            avatar: profileRes.rows[0]?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${userRecord.id}`,
        };
        const token = this.generateUserToken(user.id);
        return { user, token };
    }
    // --- VENDOR AUTH ---
    static async registerVendor(data) {
        const { hotelName, ownerEmail, password } = data;
        if (!hotelName || !ownerEmail || !password) {
            throw new ApiError(400, "Hotel name, email, and password are required");
        }
        const check = await query(`SELECT id FROM vendors WHERE owner_email = $1`, [ownerEmail.toLowerCase().trim()]);
        if (check.rows.length > 0) {
            throw new ApiError(400, "Email already registered as a vendor");
        }
        const passwordHash = await bcrypt.hash(password, 10);
        const insertRes = await query(`INSERT INTO vendors (
        hotel_name, owner_email, password_hash, phone, gst_no, business_type,
        location, price, opening_time, closing_time, description, photos, amenities
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING id, hotel_name, owner_email, phone, gst_no, business_type,
                location, price, opening_time, closing_time, description,
                average_rating, total_reviews, photos, amenities, created_at, updated_at`, [
            hotelName.trim(),
            ownerEmail.toLowerCase().trim(),
            passwordHash,
            data.phone || "",
            data.gstNo || "",
            data.businessType || "Restaurant",
            data.location || "",
            data.price || 0,
            data.openingTime || "10:00 AM",
            data.closingTime || "11:00 PM",
            data.description || "",
            data.photos || [],
            data.amenities || [],
        ]);
        const rawVendor = insertRes.rows[0];
        const vendor = {
            ...rawVendor,
            _id: rawVendor.id,
            hotelName: rawVendor.hotel_name,
            ownerEmail: rawVendor.owner_email,
            businessType: rawVendor.business_type,
            openingTime: rawVendor.opening_time,
            closingTime: rawVendor.closing_time,
            averageRating: Number(rawVendor.average_rating) || 0,
            totalReviews: Number(rawVendor.total_reviews) || 0,
        };
        const token = this.generateVendorToken(vendor.id);
        return { vendor, token };
    }
    static async loginVendor(ownerEmail, password) {
        if (!ownerEmail || !password) {
            throw new ApiError(400, "Owner email and password are required");
        }
        const res = await query(`SELECT id, hotel_name, owner_email, password_hash, phone, gst_no, business_type,
              location, price, opening_time, closing_time, description,
              average_rating, total_reviews, photos, amenities, created_at, updated_at
       FROM vendors
       WHERE owner_email = $1`, [ownerEmail.toLowerCase().trim()]);
        if (res.rows.length === 0) {
            throw new ApiError(401, "Invalid email or password");
        }
        const vendorRecord = res.rows[0];
        const isCorrect = await bcrypt.compare(password, vendorRecord.password_hash);
        if (!isCorrect) {
            throw new ApiError(401, "Invalid email or password");
        }
        const { password_hash, ...safeVendor } = vendorRecord;
        const vendor = {
            ...safeVendor,
            _id: safeVendor.id,
            hotelName: safeVendor.hotel_name,
            ownerEmail: safeVendor.owner_email,
            businessType: safeVendor.business_type,
            openingTime: safeVendor.opening_time,
            closingTime: safeVendor.closing_time,
            averageRating: Number(safeVendor.average_rating) || 0,
            totalReviews: Number(safeVendor.total_reviews) || 0,
        };
        const token = this.generateVendorToken(safeVendor.id);
        return { vendor, token };
    }
}
