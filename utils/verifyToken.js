import jwt from "jsonwebtoken";
import models from "../models/index.js";
const verifyRefreshToken = async (refreshToken, isWeb) => {
  try {
    const privateKey = process.env.REFRESH_TOKEN_SECRET;

    let userRefreshToken;
    if (isWeb) {
      userRefreshToken = await models.CustomerWebToken.findOne({ token: refreshToken });
    } else {
      userRefreshToken = await models.CustomerAppToken.findOne({ token: refreshToken });
    }

    if (!userRefreshToken) {
      throw { error: true, message: "Invalid refresh token" };
    }

    const tokenDetails = jwt.verify(refreshToken, privateKey);
    return {
      tokenDetails,
      error: false,
      message: "Valid refresh token",
      userRefreshToken,
    };
  } catch (error) {
    throw { error: true, message: "Invalid refresh token", error: error.message };
  }
};

export default verifyRefreshToken;
