import jwt from "jsonwebtoken";
import models from "../models/index.js";
import { ACCESS_TOKEN_JWT_EXPIRE, ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../config.js";

const generateTokens = async (user, rememberMe = false, deviceId = "") => {
  try {
    const payload = { _id: user._id, deviceId };

    const accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {
      expiresIn: ACCESS_TOKEN_JWT_EXPIRE,
    });

    let refreshToken = null;

    const userToken = await models.UserToken.findOne({
      userId: user._id,
      deviceId,
    });

    if (userToken) {
      refreshToken = userToken.token;
    } else {
      let refreshExpireIn = rememberMe ? "30d" : "7d";
      refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, {
        expiresIn: refreshExpireIn,
      });

      await new models.UserToken({
        userId: user._id,
        token: refreshToken,
        deviceId,
      }).save();
    }

    return Promise.resolve({ accessToken, refreshToken });
  } catch (err) {
    return Promise.reject(err);
  }
};

export default generateTokens;
