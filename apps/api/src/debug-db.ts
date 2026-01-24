
import { Pool } from "pg";
import dotenv from "dotenv";
import path from "path";

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

// Explicitly load .env from the API directory
// Assuming simple structure where script is run from root or apps/api
const envPath = path.resolve(process.cwd(), "apps/api/.env");
dotenv.config({ path: envPath });

console.log("--- DB DEBUG START ---");
console.log("Current Directory:", process.cwd());
console.log("Env File Path:", envPath);

const dbUrl = process.env.DATABASE_URL;
if (!dbUrl) {
    console.error("❌ DATABASE_URL is NOT defined in environment!");
    process.exit(1);
}

console.log("✅ DATABASE_URL is present.");
console.log("   Value (first 20 chars):", dbUrl.substring(0, 20) + "...");
console.log("   Value (length):", dbUrl.length);

const pool = new Pool({
    connectionString: dbUrl,
    ssl: { rejectUnauthorized: false }
});

async function run() {
    try {
        console.log("Attempting to connect to pool...");
        const client = await pool.connect();
        console.log("✅ Connection SUCCESSFUL!");

        console.log("Querying schemas...");
        const schemas = await client.query("SELECT schema_name FROM information_schema.schemata;");
        console.log("Found Schemas:", schemas.rows.map(r => r.schema_name).join(", "));

        const targetSchema = "proposal_generator";
        if (schemas.rows.some(r => r.schema_name === targetSchema)) {
            console.log(`✅ Schema '${targetSchema}' EXISTS.`);

            console.log(`Querying tables in '${targetSchema}'...`);
            const tables = await client.query(`SELECT table_name FROM information_schema.tables WHERE table_schema = '${targetSchema}';`);
            console.log("Found Tables:", tables.rows.map(r => r.table_name).join(", "));

            // Check bios table specifically
            try {
                const count = await client.query(`SELECT count(*) FROM ${targetSchema}."bios"`);
                console.log(`✅ Table '${targetSchema}."bios"' is queryable. Rows:`, count.rows[0].count);
            } catch (err: any) {
                console.error(`❌ Failed to query '${targetSchema}."bios"':`, err.message);
            }

        } else {
            console.error(`❌ Schema '${targetSchema}' DOES NOT EXIST!`);
        }

        client.release();
    } catch (err: any) {
        console.error("❌ Connection Failed:", err);
    } finally {
        await pool.end();
        console.log("--- DB DEBUG END ---");
    }
}

run();
