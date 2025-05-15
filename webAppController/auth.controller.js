import models from "../models/index.js";
import * as functions from "../helper/functions.js";
import { asyncErrorHandler, Error, Response } from "express-error-catcher";
import generateAppTokens from "../utils/generateCustomerAppToken.js";
import generateWebTokens from "../utils/generateCustomerWebToken.js";
import setTokensCookies from "../utils/setCookies.js";
import refreshCustomerAppToken from "../utils/refreshCustomerAppToken.js";
import refreshCustomerWebToken from "../utils/refreshCustomerWebToken.js";

function generateRandomFourDigit() {
  return Math.floor(1000 + Math.random() * 9000);
}

export const customerLoginMobile = asyncErrorHandler(async (req, res) => {
  let { mobile } = req.body;
  let otp = generateRandomFourDigit();
  let message = `Hi, Your login OTP is ${otp}. Do not share this code with anyone else. Regards, Noble Diagnostics SRV IT Hub Private Limited`;

  await models.OtpMessage.create({
    mobile: mobile.trim(),
    otp: otp,
    msg: message,
  });

  const existingCustomer = await models.Customer.findOne({
    mobile: mobile,
    status: 0,
  });
  if (!existingCustomer) {
    await models.Customer.create({ mobile: mobile });
  }

  functions.sendOtpMessage(mobile, message);
  return new Response("OTP successfully sent", null, 200);
});

export const resendOtp = asyncErrorHandler(async (req, res) => {
  let { mobile } = req.body;
  let log = await models.OtpMessage.findOne({ mobile }).sort({ _id: -1 });
  let message = `Hi, Your login OTP is ${log.otp}. Do not share this code with anyone else. Regards, Noble Diagnostics SRV IT Hub Private Limited`;

  functions.sendOtpMessage(mobile, message);

  return new Response("resend otp.", null, 200);
});

export const verifyOtp = (isWeb) =>
  asyncErrorHandler(async (req, res) => {
    let { mobile, otp, token, version, appUser } = req.body;
    let generateTokens;

    if (isNull(mobile)) throw new Error("Please enter a Mobile number", 400);

    if (isNull(otp)) throw new Error("Please enter a OTP", 400);

    const OtpMessage = await models.OtpMessage.findOne({ mobile })
      .sort({ _id: -1 })
      .limit(1);

    const customer = await models.Customer.findOne({ mobile, status: 0 });

    if (!OtpMessage) throw new Error("Invalid Mobile No.", 400);

    if (otp !== OtpMessage.otp) throw new Error("Invalid OTP.", 400);

    if (isWeb) generateTokens = generateWebTokens;
    else generateTokens = generateAppTokens;

    const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } =await generateTokens(customer);

    setTokensCookies(
      res,
      accessToken,
      refreshToken,
      accessTokenExp,
      refreshTokenExp
    );

    customer.version = version;
    customer.appToken = token;
    customer.appUser = appUser;
    await customer.save();

    return new Response(
      null,
      {
        customer: {
          id: customer._id,
          mobile: customer.mobile,
          registered: customer.registered,
        },
        status: "success",
        message: "Verify successful",
        access_token: accessToken,
        refresh_token: refreshToken,
        access_token_exp: accessTokenExp,
      },
      200
    );
  });

export const getAccessToken = (isWeb) =>
  asyncErrorHandler(async (req, res) => {
    try {
      let refreshFunction;

      if (isWeb) refreshFunction = refreshCustomerWebToken;
      else refreshFunction = refreshCustomerAppToken;

      const {newAccessToken, newRefreshToken,
             newAccessTokenExp, newRefreshTokenExp} = await refreshFunction(req);

      setTokensCookies(
        res,
        newAccessToken,
        newRefreshToken,
        newAccessTokenExp,
        newRefreshTokenExp
      );

      return res.status(200).json({
        message: "New tokens generated",
        access_token: newAccessToken,
        refresh_token: newRefreshToken,
        access_token_exp: newAccessTokenExp,
      });
    } catch (error) {
      return res.status(500).json({
        message: error.message || "Internal server error",
      });
    }
  });
