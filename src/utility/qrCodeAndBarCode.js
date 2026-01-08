import QRCode from "qrcode";
import JsBarcode from "jsbarcode";

export const generateBarcode = (value, height = "50") => {
  const canvas = document.createElement("canvas");
  JsBarcode(canvas, value, {
    format: "CODE128",
    width: 2,
    height: height,
    margin: 0,
    background: "#fff",
    lineColor: "#000",
    displayValue: false,
  });
  return canvas.toDataURL("image/png");
};

export const generateQR = async (text) => {
  try {
    return await QRCode.toDataURL(text);
  } catch (err) {
    console.error(err);
  }
};
