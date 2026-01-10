import express from "express";
import cors from "cors";
import extractRouter from "./routes/extract";
import generatePdfRouter from "./routes/generatePdf";
import mapPlaces from "./routes/map-places";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/extract", extractRouter);
app.use("/api/generate-pdf", generatePdfRouter);
app.use("/api/map-places", mapPlaces);

export default app;
