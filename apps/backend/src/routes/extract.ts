import { Router } from "express";
import type { Request, Response, NextFunction } from "express";

import multer from "multer";
import { extractPdfText } from "../services/pdf.service";

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 35 * 1024 * 1024 }, // limit file size ~35MB,
  fileFilter: (req, file, cb) => {
    if (file.mimetype !== "application/pdf") {
      return cb(new Error("Only PDF files are allowed."));
    }
    cb(null, true);
  },
});

/**
 * Custom middleware for upload
 */
function uploadPdf(req: Request, res: Response, next: NextFunction) {
  upload.single("file")(req, res, (err) => {
    if (err) {
      return res.status(400).json({ error: err.message });
    }
    next();
  });
}

router.post("/", uploadPdf, async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  const result = await extractPdfText(req.file.buffer);
  if (result.detectedAddresses.length === 0) {
    res.status(404).json({ error: "No address detected" });
  }
  res.json(result);
});

export default router;
