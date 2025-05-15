import jwt from "jsonwebtoken";
import { asyncErrorHandler, Error } from "express-error-catcher";
import models from "../models/index.js";
import {
  ACCESS_TOKEN_JWT_EXPIRE,
  ACCESS_TOKEN_RES_EXPIRE,
  ACCESS_TOKEN_SECRET,
  PRIVILEGES,
  PRODUCTION,
} from "../config.js";
import { decodeAndEncode, isObjectIdsEqual } from "../helper/functions.js";
import verifyRefreshToken from "../utils/verifyRefreshToken.js";
import moment from "moment";

const permissionCheck = (method) => {
  method = typeof method === "string" ? method.toUpperCase() : null;
  const PERMISSION_MAP = [
    { field: "view", method: "GET" },
    { field: "create", method: "POST" },
    { field: "edit", method: "PUT" },
    { field: "remv", method: "DELETE" },
  ];

  return PERMISSION_MAP.find((p) => p.method === method)?.field ?? null;
};

const UserAuth = (
  { menu = null, sub_menu = null, master = false, common = false } = {},
  res
) => {
  if (typeof res !== "undefined")
    res?.status(500)?.json({
      message:
        "Ensure proper authentication middleware parameters. Refer to README.md.",
    });
  return asyncErrorHandler(async (req, res, next) => {
    try {
      if (!menu && !sub_menu && !master && !common) {
        throw new Error(
          "Unauthorized action. Ensure proper authentication middleware parameters. Refer to README.md."
        );
      }

      const token = req.cookies.token || req.headers["x-access-token"];

      let refreshTokenHeader = req.headers["x-refresh-token"];
      let refreshToken = await decodeAndEncode(refreshTokenHeader, false);

      let currentTime = moment();
      if (!refreshToken?.token) {
        throw new Error("Your session has expired", 403, { tokenErr: true });
      }

      if (!refreshToken.token && !token) {
        throw new Error("Your session has expired", 403, { tokenErr: true });
      }

      if (!refreshToken?.requestAt) {
        throw new Error("Requested time not available in headers", 403);
      }
      if (currentTime.isAfter(refreshToken?.requestAt)) {
        throw new Error("Requested time expired", 417);
      }

      let flag = false;

      if (!token) {
        const verifiedToken = await verifyRefreshToken(refreshToken.token);
        let user = await models.User.findById(verifiedToken.data._id);
        user = user.toObject();
        delete user.password;
        delete user.date;
        delete user.time;
        delete user.__v;
        delete user?.twoFactor?.secret;
        delete user?.twoFactor?.lastUsedOTP;

        const accessToken = jwt.sign({ _id: user._id }, ACCESS_TOKEN_SECRET, {
          expiresIn: ACCESS_TOKEN_JWT_EXPIRE,
        });

        res.cookie("token", accessToken, {
          maxAge: ACCESS_TOKEN_RES_EXPIRE,
          secure: true,
          sameSite: "none",
        });

        req.deviceId = verifiedToken.data?.deviceId ?? "";
        req.user = user;
        req.privilege = req.user.privilege;

        flag = true;
      } else {
        const tokenDetails = jwt.verify(token, ACCESS_TOKEN_SECRET);

        let user = await models.User.findById(tokenDetails._id);
        user = user.toObject();

        delete user.password;
        delete user.date;
        delete user.time;
        delete user.__v;
        delete user?.twoFactor?.secret;
        delete user?.twoFactor?.lastUsedOTP;

        // checking access token and refresh token are same user
        if (PRODUCTION === "true") {
          let refreshSameUser = await models.UserToken.findOne({
            token: refreshToken.token,
            userId: user?._id,
          });

          if (!refreshSameUser) {
            throw new Error("token mismatch", 403);
          }
        }

        req.deviceId = tokenDetails?.deviceId ?? "";
        req.user = user;
        req.privilege = req.user.privilege;

        flag = true;
      }

      if (flag) {
        let userId = req.user?._id;
        let userName = req?.user?.firstName ?? req.user?.username;

        let role = await models.Privilege.findById(req.privilege);

        req.isAdmin =
          isObjectIdsEqual(req.privilege, PRIVILEGES.ADMIN) ||
          isObjectIdsEqual(req.privilege, PRIVILEGES.DEVELOPER) ||
          role?.superAdmin;

        req.branch = req.headers.branch || null;
        req.subBranch = req.headers["sub-branch"] || null;
        req.franchise = req.headers.franchise || null;

        req.collectionCenter = req.headers["collection-center"] || null;
        req.branchType = req.headers["branch-type"] || null;
        req.userType = req.user?.type;

        if (role?.superAdmin || common) return next();

        if (master) {
          await models
            .UserActivity({
              ip: req.ip,
              action: "Un-Authorized Access",
              user: userName,
              show: false,
              userId: userId,
              description: `${userName} attempted to access ${req?.originalUrl}`,
            })
            .save();

          throw new Error(
            "You are not authorized to perform this action.",
            403
          );
        }

        if (menu) {
          let isValid = await models.MainMenu.findOne({
            $or: [{ name: menu }, { link: menu }],
            status: 0,
          }).select("_id module");

          if (!isValid) {
            throw new Error("This module not found or inactive", 500);
          }

          let allowed = await models.Privilege.findOne(
            {
              _id: req.privilege,
              "alloted_main_menus.id": isValid?._id,
            },
            { "alloted_main_menus.$": 1 }
          );

          allowed = allowed?.alloted_main_menus[0];

          if (!allowed[permissionCheck(req.method)] || isNull(allowed)) {
            await models
              .UserActivity({
                ip: req.ip,
                action: "Un-Authorized Access",
                user: userName,
                show: false,
                userId: userId,
                description: `[${req?.method}] - ${userName} attempted to access ${req?.originalUrl}`,
              })
              .save();

            throw new Error(
              "You are not authorized to perform this action.",
              403
            );
          }

          return next();
        }

        if (sub_menu) {
          let isValid = await models.SubMenu.findOne({
            $or: [{ name: sub_menu }, { link: sub_menu }],
            status: 0,
          }).select("mainMenu _id");

          if (!isValid) {
            throw new Error("This module not found or inactive", 500);
          }

          let allowed = await models.Privilege.findOne(
            {
              _id: req.privilege,
              "alloted_submenus.id": isValid?._id,
            },
            { "alloted_submenus.$": 1 }
          );

          allowed = allowed?.alloted_submenus[0];

          if (
            (!isNull(allowed) && !allowed[permissionCheck(req.method)]) ||
            isNull(allowed)
          ) {
            await models
              .UserActivity({
                ip: req.ip,
                action: "Un-Authorized Access",
                user: userName,
                show: false,
                userId: userId,
                description: `[${req?.method}] - ${userName} attempted to access ${req?.originalUrl}`,
              })
              .save();

            throw new Error(
              "You are not authorized to perform this action.",
              403
            );
          }

          return next();
        }
      }
    } catch (err) {
      if (err?.data?.tokenErr || err?.tokenErr) {
        return res.status(403).json({
          message: "Your session has expired. Please log in again to continue.",
          removeRefreshToken: true,
        });
      } else {
        return res
          .status(err?.statusCode ?? 400)
          .json({ message: err?.message });
      }
    }
  });
};

export default UserAuth;
