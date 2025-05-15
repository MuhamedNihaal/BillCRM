import passport from "passport";
import setTokensCookies from "../utils/setCookies.js"
import refreshCustomerAppToken from "../utils/refreshCustomerAppToken.js"
import refreshCustomerWebToken from "../utils/refreshCustomerWebToken.js"
import isTokenExpired from "../utils/isTokenExpired.js";
import { Error, asyncErrorHandler } from "express-error-catcher";
import { FRONTEND_URL } from "../config.js";


export const verify = (...roles) => {
  return asyncErrorHandler(async (req, res, next) => {
    if (!req?.customer) {
      throw new Error(`You are not allowed for this resouce`, 400);
    }
    next();
  });
};


const CustAuth = asyncErrorHandler(async (req, res, next) => {
  try {
    const accessToken = req.cookies.custAccessToken;

    if (accessToken && !isTokenExpired(accessToken)) {
      req.headers["authorization"] = `Bearer ${accessToken}`;
    } else {
      const refreshToken = req.cookies.custRefreshToken;
      if (!refreshToken) {
        throw new Error("Access Denied: No token provided", 400);
      }

      let refreshFunction;

      const isWeb =
        `${req.headers.origin}/` === FRONTEND_URL ||
        `${req.headers.origin}` === "http://localhost:3000";

      if (isWeb) refreshFunction = refreshCustomerWebToken;
      else refreshFunction = refreshCustomerAppToken;

      const { newAccessToken, newRefreshToken, newAccessTokenExp, newRefreshTokenExp } = await refreshFunction(req);

      setTokensCookies(res,newAccessToken,newRefreshToken,newAccessTokenExp,newRefreshTokenExp);

      req.headers["authorization"] = `Bearer ${newAccessToken}`;
    }
    passport.authenticate("jwt", { session: false })(req, res, next);
  } catch (error) {
    console.error("Error adding access token to header:", error.message);
    throw new Error(`${error?.message || "Access token is missing or invalid"}`, 401);
  }
});

export default CustAuth;
