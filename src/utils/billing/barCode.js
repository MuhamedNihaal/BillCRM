/* eslint-disable no-unused-vars */
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { amountFormatter, generateBarcode } from "utility";

/**
 *
 * @param {Object} params
 * @param {string} params.date
 * @param {string} params.branchName
 * @param {string} params.barcodeValue
 * @param {string} params.label
 * @returns {Promise<Blob>}
 */
export const generateBarcodeWithNoble = async ({
  date,
  branchName,
  barcodeValue,
  label,
}) => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  // const page = pdfDoc.addPage([300, 200]);
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  const barcodeBase64 = generateBarcode(barcodeValue);
  const barcodeImage = await pdfDoc.embedPng(barcodeBase64);
  const barcodeDims = barcodeImage.scale(0.7);

  page.drawText(`${date}  -  ${branchName}`, {
    x: 10,
    y: height - 20,
    size: 8,
    font,
    color: rgb(0, 0, 0),
  });

  // const branchTextWidth = font.widthOfTextAtSize(branchName, 8);
  // page.drawText(branchName, {
  //   x: (width - branchTextWidth) / 2,
  //   y: height - 20,
  //   size: 8,
  //   font,
  //   color: rgb(0, 0, 0),
  // });

  // page.drawImage(barcodeImage, {
  //   x: 10,
  //   y: height / 2 - 10,
  //   width: barcodeDims.width,
  //   height: barcodeDims.height,
  // });

  page.drawImage(barcodeImage, {
    x: 10,
    y: height - 60,
    width: barcodeDims.width,
    height: barcodeDims.height,
  });

  page.drawText(label, {
    x: 10,
    y: height - (37 + barcodeDims.height),
    size: 8,
    font: boldFont,
    color: rgb(0, 0, 0),
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
};

export const generateInvoicePDF = async () => {
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage([595, 842]);
  const { width, height } = page.getSize();
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  let tests = [
    {
      uid: "2",
      name: "Liver Function Test",
      duration: "05:00",
      isCollected: false,
      amount: 1000,
    },
  ];

  // HEADER : - patient details
  page.drawText(`Name: MUHAMMED HABEEB KV`, {
    x: 40,
    y: height - 40,
    size: 10,
    font: boldFont,
  });
  page.drawText(`Patient No: P49588`, {
    x: 40,
    y: height - 55,
    size: 10,
    font,
  });
  page.drawText(`Mobile No: 9876543210`, {
    x: 40,
    y: height - 70,
    size: 10,
    font,
  });
  page.drawText(`Mobile No: 9876543210`, {
    x: 40,
    y: height - 85,
    size: 10,
    font,
  });

  // BARCODE
  const barcodeBase64 = generateBarcode("123456789012");
  const barcodeImage = await pdfDoc.embedPng(barcodeBase64);
  const barcodeDims = barcodeImage.scale(0.7);

  // TEST TABLE
  let tableY = height - 200;
  page.drawText("Tests", { x: 40, y: tableY, size: 10, font: boldFont });
  page.drawText("Amount", { x: 500, y: tableY, size: 10, font: boldFont });
  tableY -= 20;
  tests.forEach((test) => {
    page.drawText(test.name, { x: 40, y: tableY, size: 10, font });
    page.drawText(test.amount.toFixed(2), {
      x: 500,
      y: tableY,
      size: 10,
      font,
    });
    tableY -= 20;
  });

  // --- Totals ---
  tableY -= 20;
  page.drawText(`Grand Total: 1,000`, {
    x: 400,
    y: tableY,
    size: 10,
    font: boldFont,
  });
  tableY -= 20;
  page.drawText(`Discount: 1,000`, {
    x: 400,
    y: tableY,
    size: 10,
    font,
  });
  tableY -= 20;
  page.drawText(`Net Amount: 1,000`, {
    x: 400,
    y: tableY,
    size: 10,
    font: boldFont,
  });

  const pdfBytes = await pdfDoc.save();
  return new Blob([pdfBytes], { type: "application/pdf" });
};
