import jwt from "jsonwebtoken";
import models from "../models/index.js";
import { ACCESS_TOKEN_JWT_EXPIRE, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../config.js";

/**
 *
 * @param {*} user
 * @param {boolean} rememberMe
 * @param {string} deviceId
 * @param {*} deviceInfo
 * @param {string} [refresh=null]
 * @returns {Promise<void>}
 */
const generateTokens = async (user, rememberMe = false, deviceId = "", deviceInfo = {}, refresh = null) => {
  try {
    const payload = { _id: user._id, deviceId };

    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_JWT_EXPIRE,
    });

    let refreshToken = null;

    let userToken = null;
    let isExpired = null;

    if (refresh) {
      await models.UserToken.findOneAndDelete({ token: refresh });
    } else {
      userToken = await models.UserToken.findOne({
        userId: user._id,
        deviceId,
      }).sort({ _id: -1 });

      isExpired = userToken?.expiresAt < new Date() || null;
    }

    if (userToken && !isExpired) {
      refreshToken = userToken.token;
    } else {
      let refreshExpireIn = rememberMe ? "30d" : "1d";
      const expireDuration = rememberMe ? 30 : 1;

      const expiresAt = new Date(Date.now() + expireDuration * 24 * 60 * 60 * 1000);

      refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
        expiresIn: refreshExpireIn,
      });

      await new models.UserToken({
        userId: user._id,
        token: refreshToken,
        deviceId,
        os: deviceInfo?.os ?? null,
        platform: deviceInfo?.platform ?? null,
        deviceType: deviceInfo?.deviceType ?? null,
        browser: deviceInfo?.browser ?? null,
        expiresAt,
      }).save();
    }

    return Promise.resolve({ accessToken, refreshToken });
  } catch (err) {
    return Promise.reject(err);
  }
};

export default generateTokens;
