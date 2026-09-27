import { config } from "../config/env.js";
export class ApiError extends Error {
    statusCode;
    constructor(statusCode, message) {
        super(message);
        this.statusCode = statusCode;
        Object.setPrototypeOf(this, new.target.prototype);
    }
}
export const errorHandler = (err, _req, res, _next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    if (statusCode === 500) {
        console.error("💥 Internal Server Error:", err);
    }
    res.status(statusCode).json({
        success: false,
        message,
        stack: config.isProduction ? undefined : err.stack,
    });
};
