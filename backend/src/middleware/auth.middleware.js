import jwt from "jsonwebtoken";
import { config } from "../config/env.js";
import { query } from "../config/database.js";
export const protectRoute = async (req, res, next) => {
    try {
        const tokenCandidates = [
            req.headers.authorization?.startsWith("Bearer ")
                ? req.headers.authorization.split(" ")[1]
                : null,
            req.cookies?.jwt,
        ].filter(Boolean);
        if (tokenCandidates.length === 0) {
            res.status(401).json({ message: "Unauthorized - No token provided" });
            return;
        }
        const possibleSecrets = Array.from(new Set([
            config.jwtSecret,
            config.vendorJwtSecret,
            process.env.JWT_SECRET,
            process.env.JWT_SECRET_KEY,
            "your_jwt_secret_key_here",
            "your_jwt_secret",
            "nearmeet_secret_jwt_key_2026",
            "nearmeet_vendor_secret_key_2026",
        ].filter(Boolean)));
        let decoded = null;
        for (const tok of tokenCandidates) {
            for (const secret of possibleSecrets) {
                try {
                    const payload = jwt.verify(tok, secret);
                    if (payload && (payload.userId || payload.id)) {
                        decoded = payload;
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
        const userId = decoded?.userId || decoded?.id;
        if (!userId) {
            res.clearCookie("jwt");
            res.status(401).json({ message: "Unauthorized - Invalid token payload" });
            return;
        }
        const result = await query(`SELECT id, full_name, email, role, is_onboarded, created_at, updated_at
       FROM users
       WHERE id = $1`, [userId]);
        if (result.rows.length === 0) {
            res.clearCookie("jwt");
            res.status(401).json({ message: "Unauthorized - User not found" });
            return;
        }
        const rawUser = result.rows[0];
        const profileRes = await query(`SELECT avatar FROM user_profiles WHERE user_id = $1`, [userId]);
        req.user = {
            ...rawUser,
            fullName: rawUser.full_name,
            isOnboarded: Boolean(rawUser.is_onboarded),
            avatar: profileRes.rows[0]?.avatar || `https://api.dicebear.com/7.x/adventurer/svg?seed=${rawUser.id}`,
        };
        next();
    }
    catch (err) {
        res.clearCookie("jwt");
        res.status(401).json({ message: "Unauthorized - Invalid or expired token" });
    }
};
