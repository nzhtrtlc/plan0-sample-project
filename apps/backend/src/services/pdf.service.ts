import { PDFParse } from "pdf-parse";
import { extractAddresses } from "../utils/parser";

export async function extractPdfText(buffer: Buffer) {
  const parser = new PDFParse({ data: buffer });
  const data = await parser.getText({ partial: [1] });

  return {
    detectedAddresses: extractAddresses(data.text),
  };
}
