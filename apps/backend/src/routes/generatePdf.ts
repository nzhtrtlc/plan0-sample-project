import { Router } from "express";
import { generatePdf } from "../services/generatePdf";

const router = Router();

router.post("/", async (req, res) => {
  const { projectName, billingEntity, address, fee } = req.body;

  if (!projectName || !billingEntity || !address) {
    return res.status(400).json({ error: "Missing fields" });
  }

  const pdfBytes = await generatePdf({
    projectName,
    billingEntity,
    address,
    date: new Date().toISOString().split("T")[0],
    fee,
  });

  const date = new Date();

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="project-summary-${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}.pdf"`
  );

  res.send(Buffer.from(pdfBytes));
});

export default router;
