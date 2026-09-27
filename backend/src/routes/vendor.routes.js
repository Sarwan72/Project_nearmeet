import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { VendorController } from "../controllers/vendor.controller.js";
import { protectVendorRoute } from "../middleware/vendor.middleware.js";
const router = Router();
// Vendor auth
router.post("/signup", AuthController.vendorSignup);
router.post("/login", AuthController.vendorLogin);
router.post("/logout", AuthController.vendorLogout);
// Hotels listing (public)
router.get("/hotels", VendorController.getHotels);
// Protected vendor routes
router.get("/me", protectVendorRoute, VendorController.getProfile);
router.put("/profile", protectVendorRoute, VendorController.updateProfile);
router.post("/change-password", protectVendorRoute, VendorController.changePassword);
router.post("/delete", protectVendorRoute, VendorController.deleteAccount);
// Specific vendor details
router.get("/:vendorId", VendorController.getVendorById);
export default router;
