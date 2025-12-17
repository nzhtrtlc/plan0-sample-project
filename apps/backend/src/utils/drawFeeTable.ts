import { FeeSummary } from "@shared/types/project";
import { PDFPage, PDFFont, rgb } from "pdf-lib";

export function drawFeeTable(
  page: PDFPage,
  font: PDFFont,
  startY: number,
  fee: FeeSummary
): number {
  const fontSize = 11;
  const rowHeight = 22;

  const startX = 50;

  const columns = [
    { label: "Staff", width: 180 },
    { label: "Hours", width: 80 },
    { label: "Rate", width: 80 },
    { label: "Line Total", width: 100 },
  ];

  let y = startY;

  // ---- Header ----
  let x = startX;
  for (const col of columns) {
    page.drawRectangle({
      x,
      y: y - rowHeight + 4,
      width: col.width,
      height: rowHeight,
      color: rgb(0.9, 0.9, 0.9),
      borderColor: rgb(0.75, 0.75, 0.75),
      borderWidth: 1,
    });

    page.drawText(col.label, {
      x: x + 6,
      y: y - 15,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });

    x += col.width;
  }

  y -= rowHeight;

  // ---- Rows ----
  for (const line of fee.lines) {
    x = startX;

    const values = [
      line.staffName,
      line.hours.toString(),
      `$${line.rate.toFixed(2)}`,
      `$${line.lineTotal.toFixed(2)}`,
    ];

    values.forEach((text, i) => {
      page.drawRectangle({
        x,
        y: y - rowHeight + 4,
        width: columns[i].width,
        height: rowHeight,
        borderColor: rgb(0.85, 0.85, 0.85),
        borderWidth: 1,
      });

      page.drawText(text, {
        x: x + 6,
        y: y - 15,
        size: fontSize,
        font,
        color: rgb(0, 0, 0),
      });

      x += columns[i].width;
    });

    y -= rowHeight;
  }

  // ---- Total Row ----
  x = startX + columns[0].width + columns[1].width + columns[2].width;

  page.drawRectangle({
    x,
    y: y - rowHeight + 4,
    width: columns[3].width,
    height: rowHeight,
    color: rgb(0.95, 0.95, 0.95),
    borderColor: rgb(0.75, 0.75, 0.75),
    borderWidth: 1,
  });

  page.drawText(`$${fee.total.toFixed(2)}`, {
    x: x + 6,
    y: y - 15,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  });

  page.drawText("Total", {
    x: startX + 6,
    y: y - 15,
    size: fontSize,
    font,
    color: rgb(0, 0, 0),
  });

  return y - rowHeight;
}
