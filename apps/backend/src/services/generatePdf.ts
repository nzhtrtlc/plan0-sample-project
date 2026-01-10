import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { GeneratePdfInput } from "@shared/types/project";
import { drawFeeTable } from "../utils/drawFeeTable";

export async function generatePdf(
  input: GeneratePdfInput
): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]); // A4

  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const fontSize = 12;

  const {
    projectName,
    billingEntity,
    address,
    date,
    fee,
    proposedMandates,
    clientEmail,
    clientName,
    clientCompanyAddress,
    assetClass,
    projectDescription,
  } = input;

  let y = 800;

  function drawLine(label: string, value: string) {
    page.drawText(`${label}:`, {
      x: 50,
      y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });

    page.drawText(value, {
      x: 220,
      y,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });

    y -= 30;
  }

  drawLine("Project Name", projectName);
  drawLine("Billing Entity", billingEntity);
  drawLine("Location / Address", address);
  drawLine("Date", date);
  drawLine("Client Email", clientEmail);
  drawLine("Client Name", clientName);
  drawLine("Client Company Address", clientCompanyAddress);
  drawLine("Asset Class", assetClass);
  drawLine("Project Description", projectDescription);
  drawLine("Proposed Mandate", proposedMandates.join(","));

  if (fee.lines.length > 0) {
    y -= 20;

    page.drawText("Proposed Fees", {
      x: 50,
      y,
      size: 14,
      font,
    });

    y -= 20;

    y = drawFeeTable(page, font, y, fee);
  }

  return pdfDoc.save();
}
