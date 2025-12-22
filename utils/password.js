import bcrypt from "bcryptjs";
import { BCRYPT_SALT_ROUNDS } from "../config/security.js";

/**
 * Hash (encrypt) a plain-text password.
 * @param {string} plainPassword
 * @returns {Promise<string>} hashed password
 */
async function encryptPassword(plainPassword) {
  if (typeof plainPassword !== "string") throw new TypeError("Password must be a string");
  const salt = await bcrypt.genSalt(BCRYPT_SALT_ROUNDS);
  const hash = await bcrypt.hash(plainPassword, salt);
  return hash;
}

/**
 * Compare a plain-text password with a hashed password.
 * @param {string} plainPassword
 * @param {string} hashedPassword
 * @returns {Promise<boolean>} true if match
 */
async function comparePassword(plainPassword, hashedPassword) {
  if (typeof plainPassword !== "string" || typeof hashedPassword !== "string") {
    throw new TypeError("Passwords must be strings");
  }
  return bcrypt.compare(plainPassword, hashedPassword);
}

export { encryptPassword, comparePassword };
