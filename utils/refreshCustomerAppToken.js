import models from "../models/index.js";
import generateAppTokens from "./generateCustomerAppToken.js";
import verifyRefreshToken from "./verifyToken.js";

const refreshCustomerAppAccessToken = async (req) => {
  try {
    const oldRefreshToken = req.cookies.custRefreshToken;

    const {
      tokenDetails,
      error,
      userRefreshToken: customerRefreshToken,
    } = await verifyRefreshToken(oldRefreshToken);

    if (error) {
      throw new Error("Invalid refresh token");
    }
    const customer = await models.Customer.findById(tokenDetails._id);

    if (!customer) {
      throw new Error("User not found");
    }

    if (oldRefreshToken !== customerRefreshToken.token || customerRefreshToken.blacklisted) {
      throw new Error("Unauthorized access");
    }

    const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } =await generateAppTokens(customer);
    return {
      newAccessToken: accessToken,
      newRefreshToken: refreshToken,
      newAccessTokenExp: accessTokenExp,
      newRefreshTokenExp: refreshTokenExp,
    };
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

export default refreshCustomerAppAccessToken;
