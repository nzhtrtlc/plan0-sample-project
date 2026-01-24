import { Router } from "express";
import pool from "../utils/db";

const router = Router();

router.get("/", async (req, res) => {
	try {
		const result = await pool.query('SELECT id, name FROM proposal_generator."bios" ORDER BY name ASC');
		res.json(result.rows);
	} catch (err: any) {
		console.error("Database query error:", err);
		res.status(500).json({
			error: "Database Error",
			message: err.message || "Unknown error occurred while fetching data",
			details: {
				code: err.code,
				routine: err.routine
			},
			debug: {
				has_db_url: !!process.env.DATABASE_URL,
				url_len: process.env.DATABASE_URL?.length
			}
		});
	}
});

export default router;

