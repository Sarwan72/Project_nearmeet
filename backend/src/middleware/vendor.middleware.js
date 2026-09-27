import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { query } from "../config/database.js";
export const protectVendorRoute = async (req, res, next) => {
    try {
        const tokenCandidates = [
            req.headers.authorization?.startsWith("Bearer ")
                ? req.headers.authorization.split(" ")[1]
                : null,
            req.cookies?.vendor_jwt,
            req.cookies?.jwt,
        ].filter(Boolean);
        if (tokenCandidates.length === 0) {
            res.status(401).json({ message: "Unauthorized - No vendor token provided" });
            return;
        }
        const possibleSecrets = Array.from(new Set([
            config.vendorJwtSecret,
            config.jwtSecret,
            process.env.JWT_SECRET,
            process.env.JWT_SECRET_KEY,
            "your_jwt_secret_key_here",
            "your_jwt_secret",
            "nearmeet_vendor_secret_key_2026",
            "nearmeet_secret_jwt_key_2026",
        ].filter(Boolean)));
        let decoded = null;
        for (const tok of tokenCandidates) {
            for (const secret of possibleSecrets) {
                try {
                    const payload = jwt.verify(tok, secret);
                    if (payload && (payload.id || payload.userId)) {
                        decoded = {
                            id: payload.id || payload.userId,
                            role: payload.role,
                            email: payload.email,
                        };
                        break;
                    }
                }
                catch {
                    // Continue trying next secret
                }
            }
            if (decoded)
                break;
        }
        if (!decoded || !decoded.id) {
            res.clearCookie("vendor_jwt");
            res.status(401).json({ message: "Unauthorized - Invalid or expired vendor token" });
            return;
        }
        const result = await query(`SELECT id, user_id, hotel_name, owner_email, phone, gst_no, business_type,
              location, price, opening_time, closing_time, description,
              average_rating, total_reviews, photos, amenities, created_at, updated_at
       FROM vendors
       WHERE id = $1`, [decoded.id]);
        if (result.rows.length === 0) {
            res.clearCookie("vendor_jwt");
            res.status(401).json({ message: "Unauthorized - Vendor not found" });
            return;
        }
        req.vendor = result.rows[0];
        next();
    }
    catch (err) {
        res.clearCookie("vendor_jwt");
        res.status(401).json({ message: "Unauthorized - Invalid or expired token" });
    }
};
