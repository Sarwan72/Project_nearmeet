import { Pool } from "pg";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../.env") });
dotenv.config({ path: path.resolve(__dirname, "../../.env") });
const connectionString = process.env.DATABASE_URL ||
    "postgresql://postgres:postgres@localhost:5432/nearmeet";
const isProduction = process.env.NODE_ENV === "production";
export const pool = new Pool({
    connectionString,
    ssl: isProduction ? { rejectUnauthorized: false } : false,
});
async function runMigrations() {
    console.log("🚀 Starting PostgreSQL migrations on:", connectionString.replace(/:[^:@]+@/, ":****@"));
    const client = await pool.connect();
    try {
        // 1. Create migrations tracking table
        await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        id SERIAL PRIMARY KEY,
        filename VARCHAR(255) UNIQUE NOT NULL,
        executed_at TIMESTAMPTZ DEFAULT NOW()
      );
    `);
        // 2. Fetch already executed migrations
        const res = await client.query(`SELECT filename FROM schema_migrations`);
        const executed = new Set(res.rows.map((r) => r.filename));
        // 3. Read migration files
        let migrationsDir = path.resolve(__dirname, "../database/migrations");
        if (!fs.existsSync(migrationsDir)) {
            migrationsDir = path.resolve(__dirname, "../../database/migrations");
        }
        if (!fs.existsSync(migrationsDir)) {
            throw new Error(`Migrations directory not found at: ${migrationsDir}`);
        }
        const files = fs
            .readdirSync(migrationsDir)
            .filter((f) => f.endsWith(".sql"))
            .sort();
        console.log(`📁 Found ${files.length} migration files.`);
        for (const file of files) {
            if (executed.has(file)) {
                console.log(`⏩ Skipping already executed: ${file}`);
                continue;
            }
            console.log(`▶️ Executing migration: ${file}...`);
            const sql = fs.readFileSync(path.join(migrationsDir, file), "utf-8");
            await client.query("BEGIN");
            try {
                await client.query(sql);
                await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
                await client.query("COMMIT");
                console.log(`✅ Completed migration: ${file}`);
            }
            catch (err) {
                await client.query("ROLLBACK");
                console.error(`❌ Migration failed in ${file}:`, err);
                throw err;
            }
        }
        console.log("🎉 All migrations applied successfully!");
    }
    finally {
        client.release();
        await pool.end();
    }
}
runMigrations().catch((err) => {
    console.error("Migration runner failed:", err.message || err);
    if (err.code)
        console.error("Error Code:", err.code);
    process.exit(1);
});
