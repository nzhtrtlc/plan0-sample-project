import { Router } from "express";
import multer from "multer";

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

router.post("/", upload.single("file"), async (req, res) => {
	try {
		if (!req.file) {
			return res
				.status(400)
				.json({ error: "file is required (field name: file)" });
		}
	} catch (err) {
		return res.status(500).json({ error: (err as Error).message });
	}
    res.json({fileName: req.file.originalname})
});

export default router;
