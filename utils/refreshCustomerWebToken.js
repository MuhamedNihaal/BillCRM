import models from "../models/index.js";
import generateWebTokens from "./generateCustomerWebToken.js";
import verifyRefreshToken from "./verifyToken.js";

const refreshCustomerWebToken = async (req) => {
  try {
    const oldRefreshToken = req.cookies.custRefreshToken;

    const { tokenDetails, error } = await verifyRefreshToken(oldRefreshToken, true);

    if (error) {
      throw new Error("Invalid refresh token");
    }
    const customer = await models.Customer.findById(tokenDetails._id);

    if (!customer) {
      throw new Error("User not found");
    }

    const customerRefreshToken = await models.CustomerWebToken.findOne({
      customerId: tokenDetails._id,
    });

    if (oldRefreshToken !== customerRefreshToken.token || customerRefreshToken.blacklisted) {
      throw new Error("Unauthorized access");
    }


    const { accessToken, refreshToken, accessTokenExp, refreshTokenExp } =
      await generateWebTokens(customer);
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

export default refreshCustomerWebToken;
