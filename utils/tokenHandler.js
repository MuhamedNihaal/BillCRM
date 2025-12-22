import jwt from "jsonwebtoken";

import models from "@/models/index.js";
import * as config from "@/config/index.js";
import { splitTokenAndRot } from "./splitToken.js";
import { Error } from "express-error-catcher";

/**
 *
 * @param {Object} params - The parameters object
 * @param {*} params.user - The user object containing user details
 * @param {string} [params.platform="crm"] - Which platform crm, app, website
 * @param {boolean} [params.rememberMe=false] - Whether to extend token expiration for "remember me" functionality
 * @param {Object} params.deviceInfo - Device information object
 * @param {string} params.deviceInfo.deviceId - Unique identifier for the device
 * @param {string} params.deviceInfo.os - Operating system (e.g., "iOS", "Android", "Windows")
 * @param {string} params.deviceInfo.platform - Platform identifier (e.g., x64, arm)
 * @param {string} params.deviceInfo.deviceType - Device type (e.g., "mobile", "desktop")
 * @param {string} params.deviceInfo.browser - Browser identifier (e.g., "Chrome", "Firefox")
 * @param {string} [params.refresh=null] - Optional existing refresh token for token rotation
 * @param {string} [params.ip=null] - Optional IP address of the user
 *
 * @returns {Promise<{accessToken: string, refreshToken: string, accessTokenSplit: object, socketToken: string}>} Promise resolving to an object containing accessToken and refreshToken
 */
export async function generateToken({ user, platform = "crm", rememberMe = false, deviceInfo = {}, refresh = null, ip = null }) {
  try {
    if (!user || !platform) throw new Error("User and platform are required to generate tokens");

    let payload = { id: user?._id };

    // deleting old refresh token
    if (refresh) {
      await models.UserTokens.deleteOne({ token: refresh, production: config.production });
    } else {
      await models.UserTokens.deleteMany({ user: user?._id, deviceId: deviceInfo.deviceId, production: config.production });
    }

    let accessTokenOptions = config.jwt_access(platform);
    let socketTokenTokenOptions = config.jwt_access(`${platform}-socket`, "1day");
    let refreshTokenOptions = config.jwt_refresh(platform, rememberMe);

    const accessToken = jwt.sign(payload, accessTokenOptions.secret, {
      expiresIn: accessTokenOptions.expiresIn,
      header: { kid: deviceInfo?.deviceId },
    });

    const socketToken = jwt.sign(payload, socketTokenTokenOptions.secret, {
      expiresIn: accessTokenOptions.expiresIn,
      header: { kid: deviceInfo?.deviceId },
    });

    const refreshToken = jwt.sign(payload, refreshTokenOptions.secret, {
      expiresIn: refreshTokenOptions.expiresIn,
      header: { kid: deviceInfo?.deviceId },
    });

    await models.UserTokens.create({
      ip,
      user: user?._id,
      token: refreshToken,
      deviceId: deviceInfo?.deviceId || null,

      os: deviceInfo?.os || null,
      platform: deviceInfo?.platform || null,
      deviceType: deviceInfo?.deviceType || null,
      browser: deviceInfo?.browser || null,
      production: config.production,
    });

    return Promise.resolve({ accessToken, accessTokenSplit: splitTokenAndRot(accessToken), refreshToken, socketToken });
  } catch (error) {
    if (error.code === 11000) {
      return Promise.reject({ message: "This device already in using", statusCode: 400 });
    }
    return Promise.reject(error);
  }
}

/**
 * @typedef {Object} VerifyParams
 * @property {string} token - The JWT token to verify.
 * @property {"crm"|"app"|"website"} [platform="crm"] - The platform identifier used to resolve the correct signing secret.
 * @property {"access"|"refresh"|"socket"|"media"} type - The type of token to verify ("access", "refresh", "socket", "media").
 */

/**
 * @typedef {Object} VerifyResult
 * @property {string} id - The user ID encoded in the token.
 * @property {number} iat - Issued-at timestamp (in seconds since Unix epoch).
 * @property {number} exp - Expiration timestamp (in seconds since Unix epoch).
 * @property {string|null} deviceId - The device identifier extracted from the JWT header (`kid`) or `null` if not present.
 */

/**
 * Verifies an access token for a specific platform and extracts token payload information.
 *
 * @function verifyToken
 * @description
 * This function validates a JWT access token using the platform-specific secret.
 * It decodes the token to extract its payload and retrieves the `deviceId` from the JWT header's `kid` field if available.
 * @param {VerifyParams} params - The verification parameters.
 * @throws {Error} Throws if the token, platform, or token type is missing, or if verification fails.
 * @returns {VerifyResult} The verified token payload with metadata.
 *
 * @example
 * const accessData = verifyToken({
 *   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   platform: "crm",
 *   type: "access"
 * });
 *
 * const refreshData = verifyToken({
 *   token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   platform: "crm",
 *   type: "refresh",
 *   rememberMe: true
 * });
 */
export function verifyToken({ token, platform, type }) {
  try {
    if (!token) throw new Error("token is required", 400);
    if (!platform || !["crm", "website", "app"].includes(platform)) {
      throw new Error("platform type must be either 'crm' , 'website' or 'app'", 400);
    }
    if (!type || !["access", "refresh", "socket", "media"].includes(type)) {
      throw new Error("token type must be either 'access' , 'refresh' or 'socket'", 400);
    }

    const decode = jwt.decode(token, { complete: true });

    const tokenOptions =
      type === "media"
        ? config.jwt_media(platform)
        : type === "socket"
        ? config.jwt_access(`${platform}-socket`, "1day")
        : type === "access"
        ? config.jwt_access(platform)
        : config.jwt_refresh(platform);

    const data = jwt.verify(token, tokenOptions.secret);

    return { ...data, deviceId: decode.header.kid ?? null };
  } catch (error) {
    if (error.name === "JsonWebTokenError") {
      throw new Error("Invalid token", 401, { tokenErr: true });
    }
    throw error;
  }
}

/**
 * Normalizes JWT errors into user-friendly messages.
 *
 * @param {Error} error - The error object thrown by jwt.verify or your token logic.
 * @returns {{ status: number, message: string }}
 */
export function handleJwtError(error, data = {}) {
  switch (error.name) {
    case "TokenExpiredError":
      throw new Error("Your session has expired. Please log in again.", 401, data);
    case "JsonWebTokenError":
      throw new Error("Invalid token. Please log in again.", 401, data);
    case "NotBeforeError":
      throw new Error("Token not active yet. Try again later.", 401, data);
    default:
      throw new Error(error?.message ?? "Token verification failed.", error?.statusCode ?? 400);
  }
}
