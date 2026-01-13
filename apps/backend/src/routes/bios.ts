import { Router } from "express";
import multer from "multer";
import pool from "../utils/db";

const router = Router();

const upload = multer({
	storage: multer.memoryStorage(),
	limits: {
		fileSize: 30 * 1024 * 1024, // 30MB
	},
	fileFilter: (_req, file, cb) => {
		// pdf | doc | docx only
		const allowed = new Set([
			"application/pdf",
			"application/msword",
			"application/vnd.openxmlformats-officedocument.wordprocessingml.document",
		]);
		if (!allowed.has(file.mimetype)) {
			return cb(new Error("Unsupported file type. Only PDF/DOC/DOCX allowed."));
		}
		cb(null, true);
	},
});

const uploadMiddleware = upload.array("files");

router.get("/", async (req, res) => {
	try {
		const result = await pool.query('SELECT * FROM pg_bios ORDER BY "createdAt" DESC');
		res.json(result.rows);
	} catch (err: any) {
		console.error("Database query error:", err);
		res.status(500).json({
			error: "Database Error",
			message: err.message || "Unknown error occurred while fetching data"
		});
	}
});

router.post("/", (req, res, next) => {
	uploadMiddleware(req, res, (err) => {
		if (err) {
			console.error("Multer upload error:", err);
			if (err instanceof multer.MulterError) {
				return res.status(400).json({
					error: "Multer Error",
					message: err.message,
					code: err.code,
					field: err.field || "files",
					hint: "Ensure your Postman key is exactly 'files' and you don't have empty rows in form-data."
				});
			}
			return res.status(400).json({
				error: "Upload Error",
				message: err.message || "Unknown upload error"
			});
		}
		next();
	});
}, async (req, res) => {
	try {
		const files = req.files as Express.Multer.File[];
		if (!files || files.length === 0) {
			return res
				.status(400)
				.json({ error: "No files found", message: "files are required (field name: files)" });
		}

		const displayName = req.body.displayName || "";
		const insertedFiles = [];

		for (const file of files) {
			const queryText = `
                INSERT INTO pg_bios (
                    "originalFileName", 
                    "s3Key", 
                    status, 
                    "displayName", 
                    "extractedJson", 
                    "rawText"
                ) 
                VALUES ($1, $2, $3, $4, $5, $6) 
                RETURNING id
            `;

			const values = [
				file.originalname,
				`temp/${Date.now()}-${file.originalname}`,
				'pending',
				displayName || null,
				null,
				""
			];

			const result = await pool.query(queryText, values);
			insertedFiles.push({
				id: result.rows[0].id,
				originalFileName: file.originalname
			});
		}

		res.json({
			message: "Files uploaded and records created",
			count: insertedFiles.length,
			files: insertedFiles
		});
	} catch (err: any) {
		console.error("Database query error:", err);
		return res.status(500).json({
			error: "Database Error",
			message: err.message || "Unknown error occurred while inserting data"
		});
	}
});

export default router;

