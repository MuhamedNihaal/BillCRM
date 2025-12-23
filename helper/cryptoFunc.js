import * as config from "@/config/index.js";
import SafeCipher from "safe-cipher";

import crypto from "crypto";
import fs from "fs";

/**
 * @param {string} data
 * @param {boolean} [encode=true] If true, the data will be encoded (encrypted).
 * If false, the data will be decoded (decrypted).
 * @returns {string}
 */

export const decodeAndEncode = (data, encode = true) => {
  let secretKey = config.SECRET_KEY;
  let iv = config.SECRET_IV;

  let safeCipher = new SafeCipher(secretKey, iv);

  if (!encode) {
    return safeCipher.decryptData(data);
  }
  return safeCipher.encryptData(data);
};

export const generateFileHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);

    stream.on("data", (data) => hash.update(data));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", reject);
  });
};

/**
 * Generate an HMAC SHA-1 signature.
 *
 * @param {Object} params
 * @param {string} params.prefix - Prefix for signature (e.g., "sha1=").
 * @param {object|string} params.payload - Raw request body or string.
 * @param {string} params.secret - Secret key used for hashing.
 * @returns {string} Formatted signature e.g. "sha1=abc123..."
 *
 * @throws {Error} If required params are missing.
 */
export function generateSignature({ prefix = "sha1=", payload, secret }) {
  if (!secret) {
    throw new Error("Secret key is required for signature generation.");
  }

  if (payload === undefined || payload === null) {
    throw new Error("Payload is required for signature generation.");
  }

  const bodyString = typeof payload === "string" ? payload : JSON.stringify(payload);

  const hash = crypto.createHmac("sha1", secret).update(bodyString).digest("hex");

  return `${prefix}${hash}`;
}
