import jwt from "jsonwebtoken";
import models from "../models/index.js";
import { REFRESH_TOKEN_SECRET } from "../config.js";

const verifyRefreshToken = (refreshToken) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (isNull(refreshToken)) {
        reject({
          success: false,
          message: "Your session has expired",
          tokenErr: true,
        });
      }

      const tokenDetails = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);

      const details = await models.UserToken.findOne({
        token: refreshToken,
        deviceId: tokenDetails?.deviceId,
        blacklisted: false,
      });

      if (!details)
        return reject({
          success: false,
          message: "Your session has expired",
          tokenErr: true,
        });

      resolve({
        data: tokenDetails,
        tokenData: details,
        success: true,
        message: "Your session is valid",
      });
    } catch (error) {
      reject({
        success: false,
        message: "Your session has expired",
        tokenErr: true,
      });
    }
  });
};

export default verifyRefreshToken;
