import jwt from "jsonwebtoken";
import { asyncErrorHandler, Error } from "express-error-catcher";
import models from "../models/index.js";
import { ACCESS_TOKEN_SECRET, PRIVILEGES, PRODUCTION } from "../config.js";
import { isObjectIdsEqual } from "../helper/functions.js";
import verifyRefreshToken from "../utils/verifyRefreshToken.js";
import { userActivity } from "../utils/userActivityGen.js";
import generateTokens from "../utils/generateUserToken.js";

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

const UserAuth = ({ menu = null, sub_menu = null, master = false, common = false } = {}, res) => {
  if (typeof res !== "undefined") {
    res?.status(500)?.json({
      message: "Ensure proper authentication middleware parameters. Refer to README.md.",
    });
  }

  return asyncErrorHandler(async (req, res, next) => {
    try {
      if (!menu && !sub_menu && !master && !common) {
        throw new Error("Unauthorized action. Ensure proper authentication middleware parameters. Refer to README.md.");
      }

      const token = req.cookies.token || req.headers["x-access-token"];
      const refreshToken = req.cookies["refresh-token"] || req.headers["x-refresh-token"];

      let flag = false;

      const { data: refreshData, tokenData } = await verifyRefreshToken(refreshToken);

      if (!token) {
        let user = await models.User.findById(refreshData._id).populate("privilege", "name");
        user = user.toObject();
        delete user.password;
        delete user.date;
        delete user.time;
        delete user.__v;
        // delete user?.twoFactor?.secret;
        delete user?.twoFactor?.lastUsedOTP;

        let rememberMe = refreshData.exp - refreshData.iat === 604800 ? false : true;

        const { accessToken, refreshToken: newRefreshToken } = await generateTokens(user, rememberMe, refreshData?.deviceId, tokenData, refreshToken);

        res.cookie("token", accessToken, {
          secure: true,
          sameSite: "none",
          // maxAge: ACCESS_TOKEN_RES_EXPIRE,
        });

        res.cookie("refresh-token", newRefreshToken, {
          secure: true,
          sameSite: "none",
          ...(rememberMe ? { maxAge: 30 * 24 * 60 * 60 * 1000 } : {}),
        });

        req.deviceId = newRefreshToken.data?.deviceId ?? "";
        req.user = user;
        req.privilege = req.user.privilege?._id;

        flag = true;
      } else {
        let tokenDetails = null;

        let user = null;
        try {
          tokenDetails = await jwt.verify(token, ACCESS_TOKEN_SECRET);
          user = await models.User.findById(tokenDetails?._id).populate("privilege", "name");
        } catch (error) {
          tokenDetails = refreshData;

          let rememberMe = refreshData.exp - refreshData.iat === 604800 ? false : true;

          user = await models.User.findById(refreshData?._id).populate("privilege", "name");

          const { accessToken, refreshToken: newRefreshToken } = await generateTokens(
            user,
            rememberMe,
            refreshData?.deviceId,
            tokenData,
            refreshToken
          );

          res.cookie("token", accessToken, {
            secure: true,
            sameSite: "none",
          });

          res.cookie("refresh-token", newRefreshToken, {
            secure: true,
            sameSite: "none",
            ...(rememberMe ? { maxAge: 30 * 24 * 60 * 60 * 1000 } : {}),
          });
        }

        user = user.toObject();

        delete user.password;
        delete user.date;
        delete user.time;
        delete user.__v;
        // delete user?.twoFactor?.secret;
        delete user?.twoFactor?.lastUsedOTP;

        // checking access token and refresh token are same user
        if (PRODUCTION === "true") {
          let refreshSameUser = await models.UserToken.findOne({
            token: refreshToken,
            userId: user?._id,
          });

          if (!refreshSameUser) {
            throw new Error("Token mismatch", 403);
          }
        }

        req.deviceId = tokenDetails?.deviceId ?? "";
        req.user = user;
        req.privilege = req.user.privilege?._id;

        flag = true;
      }

      if (flag) {
        let user = req.user;
        let userId = user?._id;
        let userName = user?.firstName ?? user?.username;

        let role = await models.Privilege.findById(req.privilege);

        const isAdmin =
          isObjectIdsEqual(req.privilege, PRIVILEGES.ADMIN) || isObjectIdsEqual(req.privilege, PRIVILEGES.DEVELOPER) || role?.superAdmin;

        req.isAdmin = isAdmin;

        let branchMap = {
          1: "branch",
          2: "subBranch",
          3: "franchise",
        };

        let selectedBranchUser = null;
        if (!isAdmin) {
          selectedBranchUser = user[branchMap[user?.type]];
        }

        if (!isAdmin && !selectedBranchUser) {
          throw new Error("first assign a branch to continue..", 403);
        }

        req.userType = user?.type;

        if (isAdmin) {
          req.branch = req.headers.branch || null;
          req.subBranch = req.headers["sub-branch"] || null;
          req.franchise = req.headers.franchise || null;

          req.collectionCenter = req.headers["collection-center"] || null;
          req.branchType = Number(req.headers["branch-type"]) || null;
          req.department = req.headers["department"] || null;
        } else if (user?.type === 1) {
          req.branch = selectedBranchUser;
          req.branchType = Number(req.headers["branch-type"]) || user?.type;
          req.subBranch = req.headers["sub-branch"] || null;
          req.franchise = req.headers.franchise || null;
        } else if (user?.type === 2) {
          req.branchType = user?.type;
          req.subBranch = selectedBranchUser;
        } else if (user?.type === 2) {
          req.branchType = user?.type;
          req.franchise = selectedBranchUser;
        }

        if (role?.superAdmin || common) return next();

        if (master) {
          userActivity({ req, action: "Un-Authorized Access", description: `${userName} attempted to access ${req?.originalUrl}` });

          throw new Error("You are not authorized to perform this action.", 403);
        }

        if (menu) {
          let isValid = await models.MainMenu.findOne({
            $or: [{ name: menu }, { path: menu }],
            status: 0,
          }).select("_id module");

          if (!isValid) {
            throw new Error("You do not have permission to perform this action in this menu.", 500);
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

            throw new Error("You are not authorized to perform this action.", 403);
          }

          return next();
        }

        if (sub_menu) {
          let isValid = await models.SubMenu.findOne({
            $or: [{ name: sub_menu }, { path: sub_menu }],
            status: 0,
          }).select("mainMenu _id");

          if (!isValid) {
            throw new Error("You do not have permission to perform this action in this sub menu.", 500);
          }

          let allowed = await models.Privilege.findOne(
            {
              _id: req.privilege,
              "alloted_submenus.id": isValid?._id,
            },
            { "alloted_submenus.$": 1 }
          );

          allowed = allowed?.alloted_submenus[0];

          if ((!isNull(allowed) && !allowed[permissionCheck(req.method)]) || isNull(allowed)) {
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

            throw new Error("You are not authorized to perform this action.", 403);
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
        return res.status(err?.statusCode ?? 400).json({ message: err?.message });
      }
    }
  });
};

export default UserAuth;
