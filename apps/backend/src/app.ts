import express from "express";
import cors from "cors";
import extractRouter from "./routes/extract";
import generatePdfRouter from "./routes/generatePdf";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/extract", extractRouter);
app.use("/api/generate-pdf", generatePdfRouter);

export default app;
