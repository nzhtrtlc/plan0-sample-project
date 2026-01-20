import { Pool } from "pg";
import dotenv from "dotenv";

const result = dotenv.config();

console.log(`[Database] Dotenv result:`, result.error ? "Error" : "Success");
console.log(`[Database] Current Working Directory: ${process.cwd()}`);
console.log(`[Database] DATABASE_URL present: ${!!process.env.DATABASE_URL}`);

if (process.env.DATABASE_URL) {
    console.log(`[Database] DATABASE_URL starts with: ${process.env.DATABASE_URL.substring(0, 10)}...`);
} else {
    console.error("[Database] DATABASE_URL is UNDEFINED. Fallback to 127.0.0.1 will occur.");
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
