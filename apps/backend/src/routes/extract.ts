import { GoogleGenAI } from "@google/genai";
import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import multer from "multer";
import { extractPdfText } from "../services/pdf-service";

const router = Router();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

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

  const mimeType = req.file.mimetype;

  // const uploadResponse = await ai.files.upload({
  //   file: new Blob([new Uint8Array(req.file.buffer)], { type: mimeType }),
  //   config: { mimeType },
  // });

  const rawDocumentText = await extractPdfText(req.file.buffer);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-lite",
    // contents: [
    //   {
    //     parts: [
    //       {
    //         fileData: {
    //           fileUri: uploadResponse.uri,
    //           mimeType: uploadResponse.mimeType,
    //         },
    //       },
    //       {
    //         text: "From this PDF document, extract the address that is most likely the address of the main project, not one of the contractors, architects etc. IF you are not confident, list out the most likely addresses.",
    //       },
    //     ],
    //   },
    // ],
    contents:
      "From this document raw text, extract the address that is most likely the address of the main project, not one of the contractors, architects etc. IF you are not confident, list out the most likely addresses, but if you are confident give the project address only." +
      rawDocumentText,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: "array",
        items: {
          type: "string",
        },
      },
    },
  });

  if (!response.text) {
    return res.status(502).json({ error: "Empty response from Gemini" });
  }

  return res.json({ result: JSON.parse(response.text) });
});

export default router;
