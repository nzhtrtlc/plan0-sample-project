import { Pool } from "pg";
import dotenv from "dotenv";
import { logger } from "@packages/utils";

dotenv.config();

// Bypass self-signed certificate issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

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
