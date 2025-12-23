import path from "path";
import fs from "fs";

import sharp from "sharp";
// import ffmpeg from "fluent-ffmpeg";

export const singleOnly = async (err, req, res, next) => {
  if (err.code === "LIMIT_UNEXPECTED_FILE") {
    return res.status(400).json({
      success: false,
      message: "Only one image is allowed for this field.",
    });
  }
  next();
};

export const compressImageFile =
  (compression = true) =>
  async (req, _res, next) => {
    if (!compression) return next();
    try {
      if (!req.file) return next();

      const file = req.file;
      const ext = path.extname(file.filename).toLowerCase();

      const originalPath = file.path;

      const imageExts = [".png", ".jpg", ".jpeg", ".webp"];
      if (!imageExts.includes(ext)) {
        return next();
      }

      const fileBuffer = await fs.promises.readFile(originalPath);
      await fs.promises.unlink(originalPath);

      const compressedName = file.filename.replace(ext, `.webp`);
      const compressedPath = path.join(file.destination, compressedName);

      await sharp(fileBuffer).webp({ quality: 70 }).toFile(compressedPath);

      req.file.filename = compressedName;
      req.file.path = compressedPath;
      req.file.size = fs.statSync(compressedPath).size;

      next();
    } catch (err) {
      console.error("Compression error:", err);
      next(err);
    }
  };

export const compressVideo = async (req, res, next) => {};
