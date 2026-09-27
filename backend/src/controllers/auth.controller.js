import { AuthService } from "../services/auth.service.js";
export class AuthController {
    static async signup(req, res, next) {
        try {
            const { fullName, email, password } = req.body;
            const { user, token } = await AuthService.registerUser(fullName, email, password);
            res.cookie("jwt", token, AuthService.getCookieOptions());
            res.status(201).json({ success: true, user, token });
        }
        catch (err) {
            next(err);
        }
    }
    static async login(req, res, next) {
        try {
            const { email, password } = req.body;
            const { user, token } = await AuthService.loginUser(email, password);
            res.cookie("jwt", token, AuthService.getCookieOptions());
            res.status(200).json({ success: true, user, token });
        }
        catch (err) {
            next(err);
        }
    }
    static async logout(_req, res) {
        res.clearCookie("jwt", AuthService.getCookieOptions());
        res.status(200).json({ success: true, message: "Logged out successfully" });
    }
    static async getMe(req, res) {
        try {
            if (req.user?.id) {
                const { UserService } = await import("../services/user.service.js");
                const fullProfile = await UserService.getFullUserProfile(req.user.id);
                res.status(200).json({ success: true, user: fullProfile.user });
                return;
            }
            res.status(200).json({ success: true, user: req.user });
        }
        catch {
            res.status(200).json({ success: true, user: req.user });
        }
    }
    // --- VENDOR AUTH ---
    static async vendorSignup(req, res, next) {
        try {
            const { vendor, token } = await AuthService.registerVendor(req.body);
            res.cookie("vendor_jwt", token, AuthService.getCookieOptions());
            res.status(201).json({ success: true, vendor, token });
        }
        catch (err) {
            next(err);
        }
    }
    static async vendorLogin(req, res, next) {
        try {
            const { ownerEmail, password } = req.body;
            const { vendor, token } = await AuthService.loginVendor(ownerEmail, password);
            res.cookie("vendor_jwt", token, AuthService.getCookieOptions());
            res.status(200).json({ success: true, vendor, token });
        }
        catch (err) {
            next(err);
        }
    }
    static async vendorLogout(_req, res) {
        res.clearCookie("vendor_jwt", AuthService.getCookieOptions());
        res.status(200).json({ success: true, message: "Vendor logged out successfully" });
    }
    static async getVendorMe(req, res) {
        res.status(200).json({ success: true, vendor: req.vendor });
    }
}
