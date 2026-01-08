import SafeCipher from "safe-cipher";
import moment from "moment";

import * as XLSX from "xlsx";
import { SECRET_IV, SECRET_KEY } from "constants/app.constant";

export const toTop = () => {
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: "smooth",
  });
};

export const truncate = (text, max = 80) => {
  return text.length > max ? text.slice(0, max) + "..." : text;
};

export const decodeAndEncode = (data, encode = true) => {
  let secretKey = SECRET_KEY;
  let iv = SECRET_IV;

  try {
    if (!secretKey || !iv) {
      throw new Error("Please provide valid secret key and iv");
    }

    let safeCipher = new SafeCipher(secretKey, iv);

    if (!encode) {
      return safeCipher.decryptData(data);
    }
    return safeCipher.encryptData(data);
  } catch (error) {
    console.log(error.message);
  }
};

export const setBrowserToken = (token) => {
  localStorage.setItem("browserToken", token);
};

export const isNull = (field) => {
  return (
    field === undefined ||
    field === "undefined" ||
    field === "" ||
    field === null ||
    field === "null"
  );
};

export const existedValue = (value) => {
  if (typeof value !== "object" || value === null) return value;

  return Object.fromEntries(
    Object.entries(value).filter(
      ([_, val]) => !isNull(val) && !(Array.isArray(val) && val.length === 0),
    ),
  );
};

export const getStatusBasedColor = (val) => {
  if (val === 0) return "neutral";
  if (val <= 20) return "success";
  if (val <= 40) return "info";
  if (val <= 60) return "warning";
  // if (val <= 100) return "error";
  return "error";
};

export const jsonToExcel = (
  jsonArray,
  sheetName = moment().format("DDMMYYhhmmss"),
) => {
  const ws = XLSX.utils.json_to_sheet(jsonArray);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, sheetName);
  XLSX.writeFile(wb, `${sheetName}.xlsx`);
};

export const setFavicon = (url) => {
  const link = document.querySelector("link[rel~='icon']");
  if (!link) {
    const newLink = document.createElement("link");
    newLink.rel = "icon";
    newLink.href = url;
    document.head.appendChild(newLink);
  } else {
    link.href = url;
  }
};
