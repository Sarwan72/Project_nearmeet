import { Pool } from "pg";
import { config } from "./env.js";
export const pool = new Pool({
    connectionString: config.databaseUrl,
    ssl: config.isProduction ? { rejectUnauthorized: false } : false,
    max: 20,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
});
pool.on("error", (err) => {
    console.error("❌ Unexpected error on idle PostgreSQL client:", err);
});
export async function testConnection() {
    try {
        const res = await pool.query("SELECT NOW()");
        console.log("🐘 PostgreSQL connected successfully at:", res.rows[0].now);
        // Auto-create vendor_user_messages table if not exists
        await pool.query(`
      CREATE TABLE IF NOT EXISTS vendor_user_messages (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
        user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        sender VARCHAR(20) NOT NULL,
        text TEXT NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS idx_vum_pair ON vendor_user_messages(user_id, vendor_id, created_at);
    `);
        return true;
    }
    catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.error("⚠️ PostgreSQL connection failed:", msg);
        console.log("ℹ️ Ensure your PostgreSQL server is running and DATABASE_URL in .env is correct.");
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
    }
    catch (err) {
        await client.query("ROLLBACK");
        throw err;
    }
    finally {
        client.release();
    }
}
