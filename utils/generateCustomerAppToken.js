import jwt from "jsonwebtoken";
import models from "../models/index.js";

const generateAppTokens = async (data) => {
  try {
    const payload = { _id: data._id };
    const accessTokenExp = Math.floor(Date.now() / 1000) + 15 * 60;
    
    const accessToken = jwt.sign(
      { ...payload, exp: accessTokenExp },process.env.ACCESS_TOKEN_SECRET
    );

    const refreshTokenExp = Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 30; 
    const refreshToken = jwt.sign(
      { ...payload, exp: refreshTokenExp },process.env.REFRESH_TOKEN_SECRET
    );

     await models.CustomerAppToken.findOneAndDelete({customerId: data._id,});

    await new models.CustomerAppToken({ customerId: data._id, token: refreshToken }).save();

    return Promise.resolve({ accessToken, refreshToken, accessTokenExp, refreshTokenExp });
  } catch (error) {
    return Promise.reject(error);
  }
};

export default generateAppTokens;
