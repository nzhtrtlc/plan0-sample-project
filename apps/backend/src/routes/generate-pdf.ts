import { Router } from "express";
import { generatePdf } from "../services/generate-pdf";

const router = Router();

router.post("/", async (req, res) => {
  if (
    !req.body.projectName ||
    !req.body.billingEntity ||
    !req.body.address ||
    !req.body.fee ||
    !req.body.proposedMandates ||
    !req.body.clientEmail ||
    !req.body.clientName ||
    !req.body.clientCompanyAddress ||
    !req.body.assetClass ||
    !req.body.projectDescription
  ) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  const pdfBytes = await generatePdf({
    ...req.body,
    date: new Date().toISOString().split("T")[0],
  });

  res.setHeader("Content-Type", "application/pdf");
  res.setHeader(
    "Content-Disposition",
    `attachment; filename="project-summary-${req.body.projectName}.pdf"`
  );

  res.send(Buffer.from(pdfBytes));
});

export default router;
