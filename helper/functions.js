import axios from "axios";
import { MessageCredential, OTP_SECRET_KEY, SECRET_IV, SECRET_KEY } from "../config.js";
import speakeasy from "speakeasy";
import SafeCipher from "safe-cipher";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { Error } from "express-error-catcher";
import models from "../models/index.js";

export const sendOtpMessage = async (mobile, message) => {
  try {
    let url = `http://otp.srvinfotech.com/api/sendhttp.php?authkey=${MessageCredential.authkey}&mobiles=91${mobile}&message=${message}&sender=${MessageCredential.sender}&route=${MessageCredential.route}&country=${MessageCredential.country}&DLT_TE_ID=${MessageCredential.DLT_TE_ID}`;
    const response = await axios.get(url);
  } catch (error) {
    console.log(error);
  }
};

export const generateRandomOTP = ({ digits = 6 }) => {
  const otp = speakeasy.totp({
    secret: OTP_SECRET_KEY,
    digits,
  });

  return {
    otp,
    expiresAt: Date.now() + 5 * 60 * 1000,
  };
};

export const decodeAndEncode = (data, encode = true) => {
  let secretKey = SECRET_KEY;
  let iv = SECRET_IV;

  let safeCipher = new SafeCipher(secretKey, iv);

  if (!encode) {
    return safeCipher.decryptData(data);
  }
  return safeCipher.encryptData(data);
};

export const validateSpaceAndLetters = (name = null, field = "Name", allowAll = false) => {
  try {
    if (!name) throw new Error(`${field} field is required`, 400);

    let nameRegex = /^[A-Za-z].*$/;

    const formattedName = name.trim();

    if (!allowAll && !nameRegex.test(formattedName)) {
      throw new Error(`${field} must start with a letter and contain at least one letter`, 400);
    }

    return formattedName;
  } catch (e) {
    throw e;
  }
};

export const checkObjectIdValid = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

export const getFileExtensionMeta = (mimeType) => {
  for (const category in supportedMetaMedia) {
    const match = supportedMetaMedia[category].find((item) => item.mimeType === mimeType);
    if (match) return match.extension;
  }
  return ".bin";
};

export const supportedMetaMedia = {
  image: [
    {
      name: "JPEG",
      extension: ".jpeg",
      mimeType: "image/jpeg",
      maxSize: 5 * 1024 * 1024,
    },
    {
      name: "JPG",
      extension: ".jpg",
      mimeType: "image/jpeg",
      maxSize: 5 * 1024 * 1024,
    },
    {
      name: "PNG",
      extension: ".png",
      mimeType: "image/png",
      maxSize: 5 * 1024 * 1024,
    },
    {
      name: "SVG",
      extension: ".svg",
      mimeType: "image/svg",
      maxSize: 5 * 1024 * 1024,
    },
  ],
  video: [
    {
      name: "MP4 Video",
      extension: ".mp4",
      mimeType: "video/mp4",
      maxSize: 16 * 1024 * 1024,
    },
  ],
  document: [
    {
      name: "Microsoft Excel",
      extension: ".xls",
      mimeType: "application/vnd.ms-excel",
      maxSize: 100 * 1024 * 1024,
    },
    {
      name: "Microsoft Excel",
      extension: ".xlsx",
      mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      maxSize: 100 * 1024 * 1024,
    },
    {
      name: "Microsoft Word",
      extension: ".doc",
      mimeType: "application/msword",
      maxSize: 100 * 1024 * 1024,
    },
    {
      name: "Microsoft Word",
      extension: ".docx",
      mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      maxSize: 100 * 1024 * 1024,
    },
    {
      name: "Microsoft PowerPoint",
      extension: ".ppt",
      mimeType: "application/vnd.ms-powerpoint",
      maxSize: 100 * 1024 * 1024,
    },
    {
      name: "Microsoft PowerPoint",
      extension: ".pptx",
      mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
      maxSize: 100 * 1024 * 1024,
    },
    {
      name: "PDF",
      extension: ".pdf",
      mimeType: "application/pdf",
      maxSize: 100 * 1024 * 1024,
    },
  ],
};

export const metaFileSupport = (allowedTypes) => {
  return (req, file, cb) => {
    const fileExtension = path.extname(file.originalname).toLowerCase();
    const fileMimeType = file.mimetype;

    let isValid = false;
    let maxSize = null;
    let fileType = null;

    allowedTypes = allowedTypes.filter((type) => ["all", "image", "video", "document"].includes(type));

    if (allowedTypes.length === 0 || !Array.isArray(allowedTypes)) allowedTypes = ["all"];

    const categoriesToCheck = allowedTypes.includes("all") ? Object.keys(supportedMetaMedia) : allowedTypes;

    for (const category of categoriesToCheck) {
      const matchedFile = supportedMetaMedia[category]?.find((item) => item.extension === fileExtension && item.mimeType === fileMimeType);

      if (matchedFile) {
        isValid = true;
        maxSize = matchedFile.maxSize;
        fileType = category;
        break;
      }
    }

    if (isValid) {
      req.fileValidation = { maxSize, fileType };
      cb(null, true);
    } else {
      let matchedFiles = [];

      for (const category of categoriesToCheck) {
        matchedFiles = [...matchedFiles, ...supportedMetaMedia[category].map(({ extension }) => extension)];
      }

      cb(new Error(`This endpoint supports only ${[...new Set(matchedFiles)].join(", ")} file formats. Please upload a valid file.`), false);
    }
  };
};

// List of file categories (e.g., ["image", "document"] if you want all pass ["all"]
export const multerUpload = (folder = "tmp", allowedTypes = ["all"]) => {
  const uploadDir = `public/${folder}`;
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
      const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
      cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
    },
  });

  return multer({
    storage,
    fileFilter: metaFileSupport(allowedTypes),
    limits: {
      fileSize: (req, file, cb) => {
        return req.fileValidation ? req.fileValidation.maxSize : 100 * 1024 * 1024;
      },
    },
  });
};

export const newFileName = async (req, res) => {
  try {
    const data = req.file;
    if (req.file) {
      data.newFileName = data.destination.replace("public/", "") + "/" + data.filename;
      res.status(200).json({ status: 200, data });
    } else {
      res.status(400).json("Something went wrong !");
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error.message);
  }
};

export const paginationValues = ({ page, limit }) => {
  if (isNull(page) || page < 1) page = 1;
  else page = Number(page);

  if (isNull(limit) || limit < 1) limit = 20;
  else limit = Number(limit);

  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const urlPathValidate = (urlPath) => /^\/[a-zA-Z0-9\-._~%!$&'()*+,;=:@\/]*$/.test(urlPath);

export const existedValue = (value) => {
  if (typeof value !== "object") return value;

  return Object.fromEntries(Object.entries(value).filter(([_, value]) => !isNull(value)));
};

export const isValidMobile = (mobile) => /^[6-9]\d{9}$/.test(mobile);
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isValidNumber = (number) => !isNull(number) && !isNaN(number) && number > 0;

export const userActivity = async (req, action, description) => {
  const data = await models
    .UserActivity({
      action,
      description,
      ip: req.ip,
      userId: req.user._id,
      user: `${req.user.firstName || ""} ${req.user.lastName || ""}`,
    })
    .save();

  return data;
};

export const getDate = () => moment().format("YYYY-MM-DD");
export const getTime = () => moment().format("HH:mm:ss");

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const isObjectIdsEqual = (first, second) => first?.toString() === second?.toString();

export const validateOfferCode = async (offerCode = null, amount = null) => {
  if (!offerCode) throw new Error("please provide offer code", 400);
  let currentDate = getDate();

  let isValidCode = await models.OfferCode.findOne({
    status: 0,
    code: { $regex: new RegExp(`^${offerCode}$`, "i") },
    validTo: { $gte: currentDate },
  }).select("type amountOrPercentage code name maxLimit allotedAmount availedAmount");

  if (!isValidCode) {
    throw new Error(`invalid offer code: ${String(offerCode)}`, 400);
  }

  if (isValidCode?.availedAmount >= isValidCode?.allotedAmount) {
    throw new Error(`offer code limit reached: ${String(offerCode)}`, 400);
  }

  if (amount) {
    let newAvailedAmount = isValidCode?.availedAmount + amount;
    if (newAvailedAmount > isValidCode?.allotedAmount) {
      throw new Error(`offer code limit reached: ${String(offerCode)}`, 400);
    }
  }

  return isValidCode;
};
