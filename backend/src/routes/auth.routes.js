import { Router } from "express";
import { AuthController } from "../controllers/auth.controller.js";
import { UserController } from "../controllers/user.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";
const router = Router();
// User auth
router.post("/signup", AuthController.signup);
router.post("/login", AuthController.login);
router.post("/logout", AuthController.logout);
router.get("/me", protectRoute, AuthController.getMe);
router.post("/onboarding", protectRoute, UserController.completeOnboarding);
export default router;
