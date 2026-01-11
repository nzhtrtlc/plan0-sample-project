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

  const { fee, ...fields } = input;

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

  const fieldOrder: Array<{
    key: keyof typeof fields;
    label: string;
  }> = [
    { key: "projectName", label: "Project Name" },
    { key: "billingEntity", label: "Billing Entity" },
    { key: "address", label: "Location / Address" },
    { key: "date", label: "Date" },
    { key: "clientEmail", label: "Client Email" },
    { key: "clientName", label: "Client Name" },
    { key: "clientCompanyAddress", label: "Client Company Address" },
    { key: "assetClass", label: "Asset Class" },
    { key: "projectDescription", label: "Project Description" },
    { key: "proposedMandates", label: "Proposed Mandates" },
    { key: "service", label: "Service" },
  ];

  fieldOrder.forEach(({ key, label }) => {
    const value = fields[key];
    const textValue = Array.isArray(value) ? value.join(", ") : value;
    drawLine(label, textValue);
  });

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
