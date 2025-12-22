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



// export const CustAuth = asyncErrorHandler(async (req, res, next) => {
//   try {
//     const accessToken = req.cookies.custAccessToken;
// console.log(accessToken,"accessTokenaccessTokenaccessTokenaccessToken")
//     if (accessToken && !isTokenExpired(accessToken)) {
//       req.headers["authorization"] = `Bearer ${accessToken}`;
//     } else {
//       const refreshToken = req.cookies.custRefreshToken;
//       if (!refreshToken) throw new Error("Access Denied: No token provided", 401);

//       const isWeb = `${req.headers.origin}/` === FRONTEND_URL;
//       const refreshFunction = isWeb ? refreshCustomerWebToken : refreshCustomerAppToken;

//       const { newAccessToken, newRefreshToken, newAccessTokenExp, newRefreshTokenExp } =
//         await refreshFunction(req);

//       setTokensCookies(res, newAccessToken, newRefreshToken, newAccessTokenExp, newRefreshTokenExp);

//       req.headers["authorization"] = `Bearer ${newAccessToken}`;
//     }

//     passport.authenticate("jwt", { session: false }, (err, customer, info) => {
//       if (err || !customer) return next(new Error("Unauthorized", 401));
//       req.customer = customer; 
//       next();
//     })(req, res, next);
//   } catch (error) {
//     console.error("Error in CustAuth:", error.message);
//     throw new Error(error?.message || "Access token is missing or invalid", 401);
//   }
// });

export const CustAuth = asyncErrorHandler(async (req, res, next) => {
  try {
    const accessToken = req.cookies.token ?? req?.cookies?.custAccessToken;
    if (!accessToken) {
      throw new Error("Access Denied: No access token", 401);
    }

    if (isTokenExpired(accessToken)) {
      throw new Error("Access token expired", 401);
    }

    req.headers["authorization"] = `Bearer ${accessToken}`;

    passport.authenticate("jwt", { session: false }, (err, customer) => {
      if (err || !customer) {
        return next(new Error("Unauthorized", 401));
      }

      req.customer = customer;
      return next();
    })(req, res, next);

  } catch (error) {
    console.error("CustAuth Error:", error);
    throw new Error(error?.message || "Invalid access token", 401);
  }
});

// export const verify = (...roles) => {
//   return asyncErrorHandler(async (req, res, next) => {
//     if (!req?.customer) {
//       throw new Error(`You are not allowed to access this resource`, 403);
//     }
//     if (roles.length && !roles.includes(req.customer.role)) {
//       throw new Error(`You do not have the required role`, 403);
//     }
//     next();
//   });
// };

export default CustAuth;
