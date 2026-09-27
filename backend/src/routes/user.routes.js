import { Router } from "express";
import { UserController } from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = Router();
// Options (interests, prompts) can be accessed publicly or authenticated
router.get("/onboarding-options", UserController.getOnboardingOptions);
// Protected user routes
router.get("/profile", protectRoute, UserController.getProfile);
router.patch("/profile", protectRoute, UserController.updateProfile);
router.put("/profile", protectRoute, UserController.updateProfile);
router.delete("/delete-account", protectRoute, UserController.deleteAccount);
// Target user public profile view
router.get("/:userId", protectRoute, UserController.getUserById);
export default router;
