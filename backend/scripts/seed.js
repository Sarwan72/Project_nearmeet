import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcryptjs";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
const connectionString = process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/nearmeet";
const isProduction = process.env.NODE_ENV === "production";
export const pool = new Pool({
    connectionString,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
});
const DEFAULT_INTERESTS = [
    { name: "Travel", category: "Lifestyle" },
    { name: "Music", category: "Entertainment" },
    { name: "Movies", category: "Entertainment" },
    { name: "Gaming", category: "Hobbies" },
    { name: "Fitness", category: "Wellness" },
    { name: "Food", category: "Food & Drink" },
    { name: "Reading", category: "Education" },
    { name: "Photography", category: "Art & Media" },
    { name: "Coding", category: "Tech" },
    { name: "Sports", category: "Wellness" },
    { name: "Art", category: "Creativity" },
    { name: "Cooking", category: "Food & Drink" },
    { name: "Nature", category: "Outdoors" },
    { name: "Dancing", category: "Lifestyle" },
    { name: "Coffee", category: "Food & Drink" },
    { name: "Yoga", category: "Wellness" },
    { name: "Pets & Animals", category: "Lifestyle" },
    { name: "Board Games", category: "Hobbies" },
];
const DEFAULT_PROMPTS = [
    "My ideal Sunday is...",
    "Two truths and a lie...",
    "The quickest way to my heart is...",
    "A perfect first date would be...",
    "Something I'm passionate about...",
    "I get overly excited about...",
    "Best travel story...",
    "Together, we could...",
];
async function runSeed() {
    console.log("🌱 Starting PostgreSQL database seed...");
    const client = await pool.connect();
    try {
        // 1. Seed Interests
        console.log("👉 Seeding Interests...");
        for (const item of DEFAULT_INTERESTS) {
            await client.query(`INSERT INTO interests (name, category)
         VALUES ($1, $2)
         ON CONFLICT (name) DO NOTHING`, [item.name, item.category]);
        }
        console.log(`✅ Seeded ${DEFAULT_INTERESTS.length} interests.`);
        // 2. Seed Prompts
        console.log("👉 Seeding Profile Prompts...");
        for (const q of DEFAULT_PROMPTS) {
            await client.query(`INSERT INTO profile_prompts (question)
         VALUES ($1)
         ON CONFLICT (question) DO NOTHING`, [q]);
        }
        console.log(`✅ Seeded ${DEFAULT_PROMPTS.length} profile prompts.`);
        // 3. Seed Demo Partner Venues (if none exist)
        const vendorCountRes = await client.query(`SELECT COUNT(*) FROM vendors`);
        if (parseInt(vendorCountRes.rows[0].count, 10) === 0) {
            console.log("👉 Seeding initial partner venues...");
            const demoPasswordHash = await bcrypt.hash("vendor123", 10);
            const demoVendors = [
                {
                    hotel_name: "The Velvet Lounge & Bistro",
                    owner_email: "velvet@nearmeet.com",
                    business_type: "Restaurant",
                    location: "Connaught Place, Central Delhi",
                    price: 1200,
                    opening_time: "11:00 AM",
                    closing_time: "11:30 PM",
                    description: "An intimate rooftop café & bistro crafted for relaxed, spark-filled offline conversations.",
                    photos: [
                        "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800&auto=format&fit=crop&q=80",
                    ],
                    amenities: ["WiFi", "Outdoor Seating", "Live Acoustic Music", "Valet Parking", "Cocktails"],
                    average_rating: 4.8,
                    total_reviews: 24,
                },
                {
                    hotel_name: "Artisan Coffee Roasters",
                    owner_email: "artisan@nearmeet.com",
                    business_type: "Café",
                    location: "Hauz Khas Village, New Delhi",
                    price: 650,
                    opening_time: "08:30 AM",
                    closing_time: "10:00 PM",
                    description: "Specialty brew bar with cozy corner tables, ambient lo-fi music, and curated pairing spaces.",
                    photos: [
                        "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800&auto=format&fit=crop&q=80",
                        "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800&auto=format&fit=crop&q=80",
                    ],
                    amenities: ["Specialty Coffee", "Quiet Ambience", "Vegan Options", "Board Games"],
                    average_rating: 4.9,
                    total_reviews: 42,
                },
            ];
            for (const v of demoVendors) {
                await client.query(`INSERT INTO vendors (
            hotel_name, owner_email, password_hash, business_type, location, price,
            opening_time, closing_time, description, photos, amenities, average_rating, total_reviews
          ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
          ON CONFLICT (owner_email) DO NOTHING`, [
                    v.hotel_name,
                    v.owner_email,
                    demoPasswordHash,
                    v.business_type,
                    v.location,
                    v.price,
                    v.opening_time,
                    v.closing_time,
                    v.description,
                    v.photos,
                    v.amenities,
                    v.average_rating,
                    v.total_reviews,
                ]);
            }
            console.log(`✅ Seeded ${demoVendors.length} demo partner venues.`);
        }
        console.log("🎉 Seeding finished successfully!");
    }
    finally {
        client.release();
        await pool.end();
    }
}
runSeed().catch((err) => {
    console.error("Seed script failed:", err.message);
    process.exit(1);
});
