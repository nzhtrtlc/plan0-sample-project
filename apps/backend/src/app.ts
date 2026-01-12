import cors from "cors";
import express from "express";
import bios from "./routes/bios";
import extractRouter from "./routes/extract";
import generatePdfRouter from "./routes/generate-pdf";
import mapPlaces from "./routes/map-places";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/extract", extractRouter);
app.use("/api/generate-pdf", generatePdfRouter);
app.use("/api/map-places", mapPlaces);
app.use("/api/bios", bios);

export default app;
