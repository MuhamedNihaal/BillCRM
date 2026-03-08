import axios from "axios";
import {
//   MessageCredential,
  OTP_SECRET_KEY,
  SECRET_IV,
  SECRET_KEY,
//   FIREBASE,
} from "../config.js";
import speakeasy from "speakeasy";
import SafeCipher from "safe-cipher";
import multer from "multer";
import path from "path";
import fs from "fs";
import { GoogleAuth } from "google-auth-library";
import NodeCache from "node-cache";
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { Error } from "express-error-catcher";
import models from "../models/index.js";
import _ from "lodash";
import NumberToWords from "number-to-words";
import { createCanvas } from "canvas";
import JsBarcode from "jsbarcode";
import QRCode from "qrcode";
import { Console } from "console";

const Cache = new NodeCache();

// export const sendOtpMessage = async (mobile, message) => {
//   try {
//     let url = `http://otp.srvinfotech.com/api/sendhttp.php?authkey=${MessageCredential.authkey}&mobiles=${mobile}&message=${message}&sender=${MessageCredential.sender}&route=${MessageCredential.route}&country=${MessageCredential.country}&DLT_TE_ID=${MessageCredential.DLT_TE_ID}`;
//     console.log("url", url);
//     const response = await axios.get(url);
//   } catch (error) {
//     console.log(error);
//   }
// };

/**
 * Deletes a file from the file system, either from the `public` directory
 * (when `previous` is true) or directly from the provided location.
 * @async
 * @function deleteUploadedFile
 * @param {string} location - The relative or absolute path of the file to delete.
 * @param {boolean} [previous=false] - If true, the function looks for the file in the `../public/` directory relative to `__dirname`.
 * @returns {Promise<void>} Resolves when the deletion process completes.
 *
 * @example
 * // Delete a file from the public directory
 * await deleteUploadedFile('uploads/image.png', true);
 *
 * @example
 * // Delete a file using its absolute path
 * await deleteUploadedFile('/var/www/uploads/image.png');
 */
export const deleteUploadedFile = (location, previous = false) => {
  if (previous) {
    let previousFile = path.join(__dirname, `../public/${location}`);
    console.log(previousFile);
    if (location && fs.existsSync(previousFile)) {
      fs.unlinkSync(previousFile);
    }
  } else if (!previous && location && fs.existsSync(location)) {
    fs.unlinkSync(location);
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

/**
 * @param {string} data
 * @param {boolean} [encode=true] If true, the data will be encoded (encrypted).
 * If false, the data will be decoded (decrypted).
 * @returns {string}
 */

export const decodeAndEncode = (data, encode = true) => {
  let secretKey = SECRET_KEY;
  let iv = SECRET_IV;

  let safeCipher = new SafeCipher(secretKey, iv);

  if (!encode) {
    return safeCipher.decryptData(data);
  }
  return safeCipher.encryptData(data);
};

export const validateSpaceAndLetters = (
  name = null,
  field = "Name",
  allowAll = false,
  schema = /^[A-Za-z].*$/,
) => {
  try {
    if (isNull(name)) throw new Error(`${field} field is required`, 400);

    const formattedName = String(name)?.trim();

    if (!allowAll && !schema.test(formattedName)) {
      throw new Error(
        `${field} must start with a letter and contain at least one letter`,
        400,
      );
    }

    return formattedName;
  } catch (e) {
    throw new Error(e?.message, 400);
  }
};

export const checkObjectIdValid = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

export const getFileExtensionMeta = (mimeType) => {
  for (const category in supportedMetaMedia) {
    const match = supportedMetaMedia[category].find(
      (item) => item.mimeType === mimeType,
    );
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
    {
      name: "SVG",
      extension: ".svg",
      mimeType: "image/svg+xml",
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
  audio: [
    {
      name: "WebM Audio",
      extension: ".webm",
      mimeType: "audio/webm",
      maxSize: 16 * 1024 * 1024,
    },
    {
      name: "AAC Audio",
      extension: ".aac",
      mimeType: "audio/aac",
      maxSize: 16 * 1024 * 1024,
    },
    {
      name: "M4A Audio",
      extension: ".m4a",
      mimeType: "audio/m4a",
      maxSize: 16 * 1024 * 1024,
    },
    {
      name: "AMR Audio",
      extension: ".amr",
      mimeType: "audio/amr",
      maxSize: 16 * 1024 * 1024,
    },
    {
      name: "MP3 Audio",
      extension: ".mp3",
      mimeType: "audio/mpeg",
      maxSize: 16 * 1024 * 1024,
    },
    {
      name: "OGG Audio",
      extension: ".ogg",
      mimeType: "audio/ogg",
      maxSize: 16 * 1024 * 1024,
    },
    {
      name: "OPUS Audio",
      extension: ".opus",
      mimeType: "audio/opus",
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
      mimeType:
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
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
      mimeType:
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
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
      mimeType:
        "application/vnd.openxmlformats-officedocument.presentationml.presentation",
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

    allowedTypes = allowedTypes.filter((type) =>
      ["all", "image", "audio", "video", "document"].includes(type),
    );

    if (allowedTypes.length === 0 || !Array.isArray(allowedTypes))
      allowedTypes = ["all"];

    const categoriesToCheck = allowedTypes.includes("all")
      ? Object.keys(supportedMetaMedia)
      : allowedTypes;

    for (const category of categoriesToCheck) {
      const matchedFile = supportedMetaMedia[category]?.find(
        (item) =>
          item.extension === fileExtension && item.mimeType === fileMimeType,
      );

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
        matchedFiles = [
          ...matchedFiles,
          ...supportedMetaMedia[category].map(({ extension }) => extension),
        ];
      }

      cb(
        new Error(
          `This endpoint supports only ${[...new Set(matchedFiles)].join(", ")} file formats. Please upload a valid file.`,
        ),
        false,
      );
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
      cb(
        null,
        `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`,
      );
    },
  });

  return multer({
    storage,
    fileFilter: metaFileSupport(allowedTypes),
    limits: {
      fileSize: (req, file, cb) => {
        return req.fileValidation
          ? req.fileValidation.maxSize
          : 100 * 1024 * 1024;
      },
    },
  });
};

export const newFileName = async (req, res) => {
  try {
    const data = req.file;
    if (req.file) {
      data.newFileName =
        data.destination.replace("public/", "") + "/" + data.filename;
      res.status(200).json({ status: 200, data });
    } else {
      res.status(400).json("Something went wrong !");
    }
  } catch (error) {
    console.log(error);
    res.status(400).json(error.message);
  }
};

/**
 *
 * @function paginationValues
 * @param {Object} params - The pagination parameters.
 * @param {number|string|null} params.page - The current page number (1-indexed). Defaults to 1 if invalid.
 * @param {number|string|null} params.limit - The number of items per page. Defaults to 20 if invalid.
 *
 * @returns {{ page: number, limit: number, skip: number }}
 * Returns an object containing:
 *  - `page`: normalized current page number
 *  - `limit`: normalized items per page
 *  - `skip`: number of items to skip (used for database queries)
 *
 * @example
 * // Example usage:
 * const { page, limit, skip } = paginationValues({ page: 3, limit: 10 });
 * // page = 3, limit = 10, skip = 20
 */
export const paginationValues = ({ page, limit }) => {
  if (isNull(page) || page < 1) page = 1;
  else page = Number(page);

  if (isNull(limit) || limit < 1) limit = 20;
  else limit = Number(limit);

  const skip = (page - 1) * limit;
  return { page, limit, skip };
};

export const urlPathValidate = (urlPath) =>
  /^\/[a-zA-Z0-9\-._~%!$&'()*+,;=:@\/]*$/.test(urlPath);

export const existedValue = (value) => {
  if (typeof value !== "object") return value;

  return Object.fromEntries(
    Object.entries(value).filter(([_, value]) => !isNull(value)),
  );
};

export const isValidMobile = (mobile) => /^[6-9]\d{9}$/.test(mobile);
export const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
export const isValidNumber = (number) =>
  !isNull(number) && !isNaN(number) && number > 0;

export const userActivity = async (req, action, description) => {
  const data = await models
    .UserActivity({
      action,
      description,
      ip: req.ip,
      userId: req.user?._id,
      user: `${req.user?.firstName || ""} ${req.user?.lastName || ""}`,
    })
    .save();

  return data;
};

export const getDate = () => moment().format("YYYY-MM-DD");
export const getTime = () => moment().format("HH:mm:ss");

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const isObjectIdsEqual = (first, second) =>
  first?.toString() === second?.toString();

export const validateOfferCode = async (offerCode = null, amount = null) => {
  try {
    if (!offerCode) throw new Error("please provide offer code", 400);
    let currentDate = getDate();

    console.log(offerCode);

    let isValidCode = await models.OfferCode.findOne({
      status: 0,
      code: { $regex: new RegExp(`^${offerCode}$`, "i") },
      validTo: { $gte: currentDate },
    }).select(
      "type amountOrPercentage code name maxLimit allotedAmount availedAmount",
    );

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
  } catch (error) {
    console.log(error);
  }
};

// export async function generateFirebaseAccessToken() {
//   let value = Cache.get("firebaseToken");
//   if (value !== undefined) {
//     return value;
//   } else {
//     const { NOTIFICATION_ICON, ...credentials } = FIREBASE;
//     const scopes = ["https://www.googleapis.com/auth/firebase.messaging"];
//     const auth = new GoogleAuth({
//       credentials: credentials,
//       scopes: scopes,
//     });

//     const client = await auth.getClient();
//     const accessToken = await client.getAccessToken();
//     // console.log("TKN : ", accessToken);

//     Cache.set("firebaseToken", accessToken.token, 3540);

//     return accessToken.token;
//   }
// }

// export const sendNotification = async (
//   { token: tokens, title, body, click_action },
//   req,
// ) => {
//   try {
//     const accessToken = await generateFirebaseAccessToken();

//     if (!accessToken) {
//       console.error("No access token to send notification");
//       return;
//     }

//     for (const token of tokens) {
//       const data = {
//         message: {
//           token: token,
//           notification: {
//             title: title,
//             body: body,
//             image: FIREBASE.NOTIFICATION_ICON,
//           },
//           // Web push
//           webpush: { fcm_options: { link: click_action } },

//           // Android support
//           android: {
//             notification: {
//               title,
//               body,
//               click_action: click_action || "",
//               sound: "default",
//               icon: FIREBASE.NOTIFICATION_ICON,
//             },
//           },

//           // iOS support
//           apns: {
//             payload: {
//               aps: {
//                 alert: { title, body },
//                 sound: "default",
//                 badge: 1,
//               },
//             },
//             fcm_options: {
//               image: FIREBASE.NOTIFICATION_ICON,
//             },
//           },
//         },
//       };

//       try {
//         await axios({
//           method: "post",
//           url: "https://fcm.googleapis.com/v1/projects/srv-crm-fe0d7/messages:send",
//           headers: {
//             Authorization: `Bearer ${accessToken}`,
//           },
//           data,
//         });

//         console.log("Firebase notification sent");
//       } catch (error) {
//         console.error(
//           "Could not send notification: ",
//           JSON.stringify(error.message),
//         );
//       }
//     }
//   } catch (error) {
//     console.log(error.message);
//   }
// };

export const amountFormatter = (amount, symbol) => {
  let output = symbol
    ? {
        style: "currency",
        currency: "INR",
      }
    : {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      };
  amount =
    typeof amount === "string"
      ? Number(amount?.replace(/[^0-9.]/g, ""))
      : typeof amount === "number"
        ? amount
        : 0;

  let formatAmount = new Intl.NumberFormat("en-IN", output).format(amount);

  return { amount, formatAmount };
};

export const generateShortcode = (name) => {
  const parts = name.trim().split(/\s+/);
  let code = "";

  if (parts.length >= 2) {
    code = parts[0].substring(0, 2) + parts[1].substring(0, 2);
  } else {
    code = parts[0].substring(0, 4);
  }

  return code.toUpperCase().padEnd(4, "X");
};

/**
 * @typedef {Object} PropsObj
 * @property {string} testId - The ID of the test to fetch bundles for
 * @property {object} [extraCondition={}] - Extra condition of Test
 */

/**
 * Fetch tests and related bundles
 * @param {PropsObj} props
 * @returns {Promise<Array>} List of test bundles
 */
export const getTests = async ({ testId, extraCondition = {} }) => {
  const testSet = new Set();
  const tests = [];

  const fetchTestBundles = async (id) => {
    return models.TestBundle.find({ test: id, status: 0 })
      .sort({ order: 1 })
      .select("test testType pointer pointerType order");
  };

  const fetchTest = async (id) => {
    const test = await models.Test.findOne({ _id: id, ...extraCondition })
      .select(
        "name type shortCode department method unit analysisType organ targetMachine duration consumable referenceRange referenceRanges",
      )
      .populate("unit", "name")
      .populate("method", "name")
      .populate("analysisType", "name")
      .populate("consumables", "name")
      .lean();
    if (!test) return null;
    return test;
  };

  const setParentRelations = async (testObj, parents) => {
    const { group, subPackage, package: pkg } = parents;
    if (group) testObj.group = await fetchTest(group);
    if (subPackage) testObj.subPackage = await fetchTest(subPackage);
    if (pkg) testObj.package = await fetchTest(pkg);
  };

  const processBundles = async (bundles, parentContext = {}) => {
    for (const bundle of bundles) {
      const { pointer, pointerType, testType, test: bundleTestId } = bundle;
      const pointerId = pointer?.toString();
      if (!pointerId) continue;

      const parent = {
        group: testType === 2 ? bundleTestId : parentContext.group,
        subPackage: testType === 6 ? bundleTestId : parentContext.subPackage,
        package: testType === 3 ? bundleTestId : parentContext.package,
      };

      if (pointerType === 1 && !testSet.has(pointerId)) {
        testSet.add(pointerId);
        const test = await fetchTest(pointerId);
        if (test) {
          await setParentRelations(test, parent);
          tests.push(test);
        }
      } else if (pointerType === 2 || pointerType === 6) {
        const childBundles = await fetchTestBundles(pointerId);
        for (const child of childBundles) {
          const childPointerId = child.pointer?.toString();
          if (!childPointerId || testSet.has(childPointerId)) continue;

          const childParent = {
            group: pointerType === 2 ? pointerId : parent.group,
            subPackage: pointerType === 6 ? pointerId : parent.subPackage,
            package: parent.package,
          };

          if (child.pointerType === 1) {
            testSet.add(childPointerId);
            const test = await fetchTest(childPointerId);
            if (test) {
              await setParentRelations(test, childParent);
              await setParentRelations(test, parent); // merge upper hierarchy
              tests.push(test);
            }
          }

          // Nested group inside sub package
          if (pointerType === 6 && child.pointerType === 2) {
            const innerBundles = await fetchTestBundles(childPointerId);
            for (const inner of innerBundles) {
              const innerPointerId = inner.pointer?.toString();
              if (
                !innerPointerId ||
                inner.pointerType !== 1 ||
                testSet.has(innerPointerId)
              )
                continue;

              testSet.add(innerPointerId);
              const test = await fetchTest(innerPointerId);
              if (test) {
                const innerParent = {
                  group: childPointerId,
                  subPackage: pointerId,
                  package: parent.package,
                };
                await setParentRelations(test, innerParent);
                await setParentRelations(test, parent); // merge full chain
                tests.push(test);
              }
            }
          }
        }
      }
    }
  };

  try {
    const rootBundles = await fetchTestBundles(testId);

    if (rootBundles.length === 0) {
      const test = await models.Test.findOne({ _id: testId, status: 0 }).select(
        "type",
      );
      if (!test) throw new Error("No test found", 404);

      if (test.type !== 1) {
        const label = { 2: "group", 3: "package", 6: "sub package" }[test.type];
        throw new Error(
          `No tests are associated with this ${label} at the moment.`,
          400,
        );
      }

      testSet.add(testId);
      tests.push(await fetchTest(testId));
      return tests?.filter(Boolean);
    }

    await processBundles(rootBundles);
    return tests?.filter(Boolean);
  } catch (error) {
    throw error;
  }
};

export const querySearchSanitize = (search) => {
  return String(search)
    ?.trim()
    ?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

export const numberToWords = (val) => {
  let number = Number(val);
  if (isNaN(number)) number = 0;

  number = _.startCase(_.toLower(NumberToWords.toWords(number)));

  return number;
};

export const generateBarcode = (value) => {
  const canvas = createCanvas();
  JsBarcode(canvas, value, {
    format: "CODE128",
    width: 2,
    height: 50,
    margin: 0,
    background: "#fff",
    lineColor: "#000",
    displayValue: false,
  });

  const base64 = canvas.toDataURL("image/png");
  return base64;
};

export const generateQrCode = async (value) => {
  try {
    const base64 = await QRCode.toDataURL(value, {
      errorCorrectionLevel: "H",
      type: "image/png",
      margin: 1,
      scale: 8,
      color: {
        dark: "#000000",
        light: "#ffffff",
      },
    });
    return base64;
  } catch (err) {
    console.error("QR Code generation failed:", err);
    throw err;
  }
};

export function arraySplitEvenly(arr) {
  if (arr.length <= 2) return [arr];

  const mid = Math.ceil(arr.length / 2);
  const left = arr.slice(0, mid);
  const right = arr.slice(mid);

  while (right.length < left.length) {
    right.push({});
  }

  return [left, right];
}

export const generateDob = (date) => {
  const startDate = moment(date);
  const endDate = moment();

  const years = endDate.diff(startDate, "years");
  startDate.add(years, "years");

  const months = endDate.diff(startDate, "months");
  startDate.add(months, "months");

  const days = endDate.diff(startDate, "days");
  return `${years}Y/${months}M/${days}D`;
};
