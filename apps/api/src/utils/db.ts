import { Pool } from "pg";
import dotenv from "dotenv";
import { logger } from "@packages/utils"; // Kept import but using console for db init safety
import path from "path";

// Try to load .env from the apps/api folder explicitly
const envPath = path.resolve(__dirname, "../../.env");
const result = dotenv.config({ path: envPath });

if (result.error) {
    // Fallback to default (CWD) if explicit path fails
    dotenv.config();
    console.log(`[DB] .env load from ${envPath} failed, trying default CWD.`);
} else {
    console.log(`[DB] Loaded .env from: ${envPath}`);
}

// Bypass self-signed certificate issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

console.log(`[DB] Env Check - DATABASE_URL exists: ${!!process.env.DATABASE_URL}`);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

if (!process.env.DATABASE_URL) {
    logger.error("❌ DATABASE_URL is missing from environment variables!");
} else {
    logger.info("✅ DATABASE_URL loaded successfully");
}

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
