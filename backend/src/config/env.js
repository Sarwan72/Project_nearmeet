import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
dotenv.config();
const isProduction =
    process.env.NODE_ENV === "production" ||
    process.env.RENDER === "true" ||
    Boolean(process.env.RENDER);

export const config = {
    port: parseInt(process.env.PORT || "5001", 10),
    nodeEnv: isProduction ? "production" : (process.env.NODE_ENV || "development"),
    isProduction,
    databaseUrl: process.env.DATABASE_URL ||
        "postgresql://postgres:postgres@localhost:5432/nearmeet",
    jwtSecret: process.env.JWT_SECRET_KEY || process.env.JWT_SECRET || "nearmeet_secret_jwt_key_2026",
    vendorJwtSecret: process.env.JWT_SECRET || process.env.JWT_SECRET_KEY || "nearmeet_vendor_secret_key_2026",
    stripeSecretKey: process.env.STRIPE_SECRET_KEY || "",
    stripe: {
        secretKey: process.env.STRIPE_SECRET_KEY || "",
    },
    geminiApiKey: process.env.GEMINI_API_KEY || "",
    cloudinary: {
        cloudName: process.env.CLOUDINARY_CLOUD_NAME || "",
        apiKey: process.env.CLOUDINARY_API_KEY || "",
        apiSecret: process.env.CLOUDINARY_API_SECRET || "",
    },
    corsOrigin: "http://localhost:5173",
    corsOrigins: [
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
    ],
};
