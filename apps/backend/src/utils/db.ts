import { Pool } from "pg";
import dotenv from "dotenv";

dotenv.config();

console.log(`[Database] Looking for .env in: ${process.cwd()}`);

if (!process.env.DATABASE_URL) {
    console.error("[Database] CRITICAL ERROR: DATABASE_URL is not defined in the environment!");
    console.error("[Database] Ensure your .env file exists and contains DATABASE_URL.");
}

// Bypass self-signed certificate issues
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

export const query = (text: string, params?: any[]) => pool.query(text, params);

export default pool;
