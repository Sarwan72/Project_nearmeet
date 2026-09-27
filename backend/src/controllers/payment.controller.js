import Stripe from "stripe";
import { config } from "../config/env.js";
const stripe = config.stripe.secretKey
    ? new Stripe(config.stripe.secretKey, {
        apiVersion: "2025-02-24.acacia",
    })
    : null;
export class PaymentController {
    static async createCheckoutSession(req, res, next) {
        try {
            const { bookingId, amount, hotelName } = req.body;
            if (!bookingId || !amount) {
                res.status(400).json({
                    success: false,
                    message: "bookingId and amount are required",
                });
                return;
            }
            if (!stripe) {
                res.status(503).json({
                    success: false,
                    message: "Stripe payment gateway is not initialized.",
                });
                return;
            }
            const clientUrl = config.corsOrigin || "http://localhost:5173";
            const session = await stripe.checkout.sessions.create({
                payment_method_types: ["card"],
                line_items: [
                    {
                        price_data: {
                            currency: "inr",
                            product_data: {
                                name: hotelName ? `Table Booking at ${hotelName}` : "NearMeet Table Reservation",
                                description: "Offline Table Meetup Booking & Concierge",
                            },
                            unit_amount: Math.max(100, Math.round(Number(amount) * 100)),
                        },
                        quantity: 1,
                    },
                ],
                mode: "payment",
                success_url: `${clientUrl}/payment?status=success&bookingId=${bookingId}&session_id={CHECKOUT_SESSION_ID}`,
                cancel_url: `${clientUrl}/payment?status=cancel&bookingId=${bookingId}`,
            });
            res.status(200).json({
                success: true,
                url: session.url,
                sessionId: session.id,
            });
        }
        catch (error) {
            console.error("Stripe checkout session creation failed:", error.message);
            next(error);
        }
    }
}
