import { Pool } from "pg";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { config } from "./env.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const isRemoteDb =
    config.isProduction ||
    Boolean(process.env.RENDER) ||
    (config.databaseUrl && (
        config.databaseUrl.includes("render.com") ||
        config.databaseUrl.includes("neon.tech") ||
        config.databaseUrl.includes("supabase.co") ||
        config.databaseUrl.includes("sslmode=require")
    ));

export const pool = new Pool({
    connectionString: config.databaseUrl,
    ssl: isRemoteDb ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});

pool.on("error", (err) => {
    console.error("❌ Unexpected error on idle PostgreSQL client:", err);
});

/**
 * Automatically applies any pending database migrations from backend/database/migrations
 */
export async function runAutoMigrations() {
    let client;
    try {
        client = await pool.connect();

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

        // 3. Locate migrations folder
        const candidatePaths = [
            path.resolve(__dirname, "../../database/migrations"),
            path.resolve(__dirname, "../database/migrations"),
            path.resolve(process.cwd(), "database/migrations"),
            path.resolve(process.cwd(), "backend/database/migrations"),
        ];

        let migrationsDir = null;
        for (const candidate of candidatePaths) {
            if (fs.existsSync(candidate)) {
                migrationsDir = candidate;
                break;
            }
        }

        if (!migrationsDir) {
            console.warn("⚠️ Migrations directory not found in candidate paths.");
            return;
        }

        const files = fs
            .readdirSync(migrationsDir)
            .filter((f) => f.endsWith(".sql"))
            .sort();

        let applied = 0;
        for (const file of files) {
            if (executed.has(file)) continue;

            const filePath = path.join(migrationsDir, file);
            const sql = fs.readFileSync(filePath, "utf-8");

            await client.query("BEGIN");
            try {
                await client.query(sql);
                await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
                await client.query("COMMIT");
                applied++;
                console.log(`✅ Applied migration: ${file}`);
            } catch (migrationErr) {
                await client.query("ROLLBACK");
                console.error(`❌ Migration failed in ${file}:`, migrationErr.message);
                throw migrationErr;
            }
        }

        if (applied > 0) {
            console.log(`🎉 Successfully applied ${applied} new migrations.`);
        } else {
            console.log("👍 Database schema is up to date.");
        }
    } catch (err) {
        console.error("⚠️ Auto-migration process warning:", err.message || err);
    } finally {
        if (client) client.release();
    }
}

export async function testConnection() {
    try {
        const res = await pool.query("SELECT NOW()");
        console.log("🐘 PostgreSQL connected successfully at:", res.rows[0].now);

        // Auto-run schema migrations
        await runAutoMigrations();

        return true;
    } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("⚠️ PostgreSQL connection failed:", msg);
        console.log("ℹ️ Ensure your PostgreSQL server is running and DATABASE_URL is correct.");
        return false;
    }
}

/**
 * Execute parameterized query
 */
export async function query(text, params) {
    const start = Date.now();
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    if (!config.isProduction && duration > 200) {
        console.warn(`🐢 Slow query (${duration}ms):`, text);
    }
    return res;
}

/**
 * Execute a transaction with automatic BEGIN, COMMIT, and ROLLBACK
 */
export async function withTransaction(callback) {
    const client = await pool.connect();
    try {
        await client.query("BEGIN");
        const result = await callback(client);
        await client.query("COMMIT");
        return result;
    } catch (err) {
        await client.query("ROLLBACK");
        throw err;
    } finally {
        client.release();
    }
}
