import { Router } from "express";
import { PaymentController } from "../controllers/payment.controller.js";
const router = Router();
router.post("/checkout", PaymentController.createCheckoutSession);
export default router;
