import { Router } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import vendorRoutes from "./vendor.routes.js";
import bookingRoutes from "./booking.routes.js";
import discoveryRoutes from "./discovery.routes.js";
import matchRoutes from "./match.routes.js";
import notificationRoutes from "./notification.routes.js";
import chatRoutes from "./chat.routes.js";
import uploadRoutes from "./upload.routes.js";
import paymentRoutes from "./payment.routes.js";
import reviewRoutes from "./review.routes.js";
import aiRoutes from "./ai.routes.js";
const apiRouter = Router();
apiRouter.use("/auth", authRoutes);
apiRouter.use("/users", userRoutes);
apiRouter.use("/vendors", vendorRoutes);
apiRouter.use("/bookings", bookingRoutes);
apiRouter.use("/discovery", discoveryRoutes);
apiRouter.use("/matches", matchRoutes);
apiRouter.use("/notifications", notificationRoutes);
apiRouter.use("/chat", chatRoutes);
apiRouter.use("/upload", uploadRoutes);
apiRouter.use("/payments", paymentRoutes);
apiRouter.use("/review", reviewRoutes);
apiRouter.use("/ai", aiRoutes);
// Health check endpoint
apiRouter.get("/health", (req, res) => {
    res.status(200).json({
        status: "ok",
        timestamp: new Date().toISOString(),
        service: "NearMeet PostgreSQL API",
    });
});
export default apiRouter;
