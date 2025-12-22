import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { Error } from "express-error-catcher";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { v4 as uuidv4 } from "uuid";
import mime from "mime-types";


/**
 * Creates a Multer file filter that allows only specific file extensions.
 *
 * @function fileFilter
 * @param {string[]} [allowedExtensions=[".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".docx", ".doc", ".pdf", ".xlsx", ".xls", ".mp4", ".mov"]]
 *        List of allowed file extensions (case-insensitive). Must include the leading dot.
 *
 * @returns {import("multer").FileFilterCallback}
 *          A Multer-compatible file filter callback that validates file extensions.
 *
 * @throws {Error} Throws an error if the uploaded file extension is not allowed.
 *
 * @example
 * // Allow only images
 * const uploaded = multerUpload({ folder: "whatsapp/contact", filter: fileFilter([".jpg", ".png"]) });
 *
 */
export const fileFilter = (
  allowedExtensions = [".png", ".jpg", ".jpeg", ".webp", ".svg", ".gif", ".docx", ".doc", ".pdf", ".xlsx", ".xls", ".mp4", ".mov"]
) => {
  return (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedExtensions.includes(ext)) {
      req.un_support_file = null;
      cb(null, true);
    } else {
      let message = `${allowedExtensions.join(",").replace(/[.,]/g, " ").replace(/\s/, "")} files are allowed`;
      req.un_support_file = message;
      cb(new Error(message, 400), false);
    }
  };
};

export const getFileExtensionMeta = (mimeType) => {
  for (const category in META_FILE_SUPPORT) {
    const match = META_FILE_SUPPORT[category].find((item) => item.mimeType === mimeType);
    if (match) return match.extension;
  }
  return ".bin";
};

export const streamToFile = async ({ stream, upload, extension = ".bin" }) => {
  const saveDir = path.join(__dirname, `../../public/uploads/${upload}`);

  if (!fs.existsSync(saveDir)) {
    fs.mkdirSync(saveDir, { recursive: true });
  }

  let date = Date.now();
  let uuid = uuidv4();

  const file_name = `${uuid}-${date}${extension}`;
  let savePath = path.join(saveDir, file_name);

  const writer = fs.createWriteStream(savePath);
  stream.pipe(writer);

  writer.on("error", (err) => {
    console.error("File write failed:", err);
  });

  return `uploads/${upload}/${file_name}`;
};

/**
 * (when `previous` is true) or directly from the provided location.
 * @async
 * @function readFileStream
 * @param {string} location - The relative or absolute path of the file to stream.
 * @param {boolean} [previous=false] - If true, the function looks for the file in the `../public/` directory relative to `__dirname`.
 * @returns {Promise<void>} Resolves when the stream
 *
 * @example
 * // Delete a file from the public directory
 * await readFileStream('uploads/image.png', true);
 *
 * @example
 * // Delete a file using its absolute path
 * await readFileStream('/var/www/uploads/image.png');
 */
export const readFileStream = (location, previous = false) => {
  if (previous) {
    let previousFile = path.join(__dirname, `../../public/${location}`);
    if (location && fs.existsSync(previousFile)) {
      return fs.createReadStream(previousFile);
    }
  } else if (!previous && location && fs.existsSync(location)) {
    return fs.createReadStream(location);
  }
};

export const getFileMeta = (filePath, fieldname = "file") => {
  const filename = path.basename(filePath);
  const mimetype = mime.lookup(filePath) || "application/octet-stream";
  const originalname = filename;
  const encoding = "7bit";
  const fullPath = path.join(__dirname, `../../public/${filePath}`);

  return {
    fieldname,
    originalname,
    encoding,
    mimetype,
    filename,
    dbPath: filePath,
    path: fullPath,
    file_title: path.parse(originalname).name ?? "file",
    size: fs.existsSync(fullPath) ? fs.statSync(fullPath).size : 0,
  };
};
