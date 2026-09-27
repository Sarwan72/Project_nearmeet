import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import fs from "fs";
import path from "path";
import { config } from "./config/env.js";
import apiRouter from "./routes/index.js";
import { errorHandler } from "./middleware/error.middleware.js";
export function createApp() {
    const app = express();
    const allowedOrigins = [
        "http://localhost:5173",
        "http://localhost:5174",
        "https://near-meet.vercel.app",
        config.corsOrigin,
    ].filter(Boolean);
    app.use(cors({
        origin: (origin, callback) => {
            if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
                callback(null, true);
            }
            else {
                callback(null, true); // Allow local development
            }
        },
        credentials: true,
        methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
        allowedHeaders: ["Content-Type", "Authorization"],
    }));
    app.use(cookieParser());
    app.use(express.json({ limit: "15mb" }));
    app.use(express.urlencoded({ extended: true, limit: "15mb" }));
    // Serve locally uploaded files as static assets
    const uploadsDir = path.resolve(process.cwd(), "public/uploads");
    if (!fs.existsSync(uploadsDir)) {
        fs.mkdirSync(uploadsDir, { recursive: true });
    }
    app.use("/uploads", express.static(uploadsDir));
    // Main API Router
    app.use("/api", apiRouter);
    // Fallback for root routes without /api prefix
    app.use("/auth", (req, res, next) => {
        req.url = `/auth${req.url}`;
        apiRouter(req, res, next);
    });
    app.use("/users", (req, res, next) => {
        req.url = `/users${req.url}`;
        apiRouter(req, res, next);
    });
    app.use("/vendors", (req, res, next) => {
        req.url = `/vendors${req.url}`;
        apiRouter(req, res, next);
    });
    app.use("/bookings", (req, res, next) => {
        req.url = `/bookings${req.url}`;
        apiRouter(req, res, next);
    });
    // Base route
    app.get("/", (req, res) => {
        res.json({
            message: "NearMeet PostgreSQL Backend API is running.",
            version: "2.0.0",
            docs: "/api/health",
        });
    });
    // Central error handler
    app.use(errorHandler);
    return app;
}
