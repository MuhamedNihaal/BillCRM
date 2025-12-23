import multer from "multer";
import path from "path";
import fs from "fs";
import { dirname } from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { Error } from "express-error-catcher";

import { compressImageFile, singleOnly } from "./multerMiddleware.js";
import { fileFilter } from "./config.js";

export * from "./config.js";

const storage = (folder) =>
  multer.diskStorage({
    destination: function (req, file, cb) {
      const uploadPath = `public/uploads/${folder}`;
      fs.mkdirSync(uploadPath, { recursive: true });
      cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      const fileExtension = path.extname(file.originalname);
      const originalFileName = path.basename(file.originalname, fileExtension);
      const fileName = originalFileName.replace(/\s/g, "-").replace(/--/, "-") + "-" + uniqueSuffix + fileExtension;
      cb(null, fileName);
    },
  });

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
    let previousFile = path.join(__dirname, `../../public/${location}`);
    if (location && fs.existsSync(previousFile)) {
      fs.unlinkSync(previousFile);
    }
  } else if (!previous && location && fs.existsSync(location)) {
    fs.unlinkSync(location);
  }
};

/**
 * @typedef {Object} MulterLimits
 * @property {number} [fieldNameSize] - Max field name size (bytes)
 * @property {number} [fieldSize] - Max non-file field size (bytes)
 * @property {number} [fields] - Max number of non-file fields
 * @property {number} [fileSize] - Max file size (bytes)
 * @property {number} [files] - Max number of files
 * @property {number} [parts] - Max number of parts (fields + files)
 * @property {number} [headerPairs] - Max header key/value pairs
 */

/**
 * @function multerUpload
 * @param {Object} options - Multer upload configuration
 * @param {string} [options.folder="tmp"] - Folder inside `public/uploads/`
 * @param {Function} [options.filter=fileFilter] - File filter callback
 * @param {Function} [options.compression=true] - Compression Reduce File size only applicable in Images
 * @param {Function} [options.required=true] - When required is true must be upload a file
 * @param {Function} [options.requiredMsg=""] - Customer required message
 * @param {MulterLimits|null} [options.limits=null]
 *
 * @returns {import("multer").Multer} Multer upload middleware instance
 *
 * @example
 * const upload = multerUpload({
 *   folder: "avatars",
 *   limits: { fileSize: 5 * 1024 * 1024 } // 5MB
 * });
 *
 * app.post("/avatar", upload.single("avatar"), (req, res) => {
 *   res.send("Uploaded!");
 * });
 *
 */
const multerUpload = ({
  folder = "tmp",
  filter,
  limits = { fileSize: 10485760 },
  compression = true,
  required = false,
  requiredMsg = "File must be required",
}) => {
  if (!filter) filter = fileFilter();

  const multerMiddleware = (req, _, next) => {
    if (req.un_support_file) throw new Error(req.un_support_file, 400);

    if (required && !req.file) {
      throw new Error(requiredMsg, 400);
    }
    if (req.file) {
      let file = req.file;

      if (file.size > req?.fileValidation?.maxSize) {
        deleteUploadedFile(file.path);

        throw new Error(`File size exceeds the maximum allowed limit of ${(req?.fileValidation?.maxSize / 1024 / 1024).toFixed(2)} MB.`, 400);
      }

      req.file.file_title = path.parse(file.originalname).name ?? "file";
      req.file.dbPath = file.destination.replace("public/", "") + "/" + file.filename;
    }
    next();
  };

  const upload = multer({
    storage: storage(folder),
    fileFilter: filter,
    limits: limits,
  });

  return {
    single: (fieldName) => [upload.single(fieldName), singleOnly, compressImageFile(compression), multerMiddleware],
    array: (fieldName, maxCount) => [upload.array(fieldName, maxCount)],
    fields: (fields) => [upload.fields(fields), multerMiddleware],
    none: () => [upload.none(), multerMiddleware],
  };
};

export default multerUpload;
export { multerUpload };
