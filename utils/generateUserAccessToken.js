import jwt from "jsonwebtoken";
import models from "../models/index.js";
import { ACCESS_TOKEN_SECRET, REFRESH_TOKEN_SECRET } from "../config.js";

const generateUserToken = async (user) => {
  try {
    let payload = { _id: user._id };
    let accessToken = jwt.sign(payload, ACCESS_TOKEN_SECRET, {expiresIn: "20d",});
    let refreshToken = jwt.sign(payload, REFRESH_TOKEN_SECRET, { expiresIn: "30d" });

    let userToken = await models.UserToken.findOne({ userId: user._id });
    if (userToken) {
      refreshToken = userToken.token;
    } else {
      await new models.UserToken({ userId: user._id, token: refreshToken }).save();
    }

    return Promise.resolve({ accessToken, refreshToken });
  } catch (err) {
    return Promise.reject(err);
  }
};


export default generateUserToken;
