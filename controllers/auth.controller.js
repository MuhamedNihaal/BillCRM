import { Router } from "express";
import { asyncErrorHandler, Response, Error } from "express-error-catcher";
import { ChangePasswordSchema, logInBodyValidation } from "../validation/validation.yup.js";
import models from "../models/index.js";
const app = Router();
import moment from "moment";
import { accountOrIpBlocking } from "../utils/rule.js";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import generateTokens from "../utils/generateUserToken.js";
import { checkObjectIdValid, decodeAndEncode } from "../helper/functions.js";
import DeviceDetector from "device-detector-js";
import jwt from "jsonwebtoken";
import { ACCESS_TOKEN_SECRET } from "../config.js";

const secret = speakeasy.generateSecret({
  name: "Noble - CRM",
});

async function loginAttemptFunc(loginAttempt = null, ip = null, username = null, user = null) {
  if (loginAttempt) {
    loginAttempt.attempts += 1;
    await loginAttempt.save();

    for (let rule of accountOrIpBlocking) {
      if (loginAttempt.attempts === rule.attempts) {
        if (user) {
          user.status = 2;
          await user.save();
        }

        loginAttempt.login_ip = ip;
        loginAttempt.username = username;
        loginAttempt.status = 2;
        loginAttempt.unblock_at = rule.block === "permanent" ? null : moment().add(rule.block.value, rule.block.unit).format("YYYY-MM-DD HH:mm:ss");
        await loginAttempt.save();
        break;
      }
    }
  } else {
    await new models.LoginAttempt({
      login_ip: ip,
      username: username,
      attempts: 1,
    }).save();
  }

  await models
    .UserActivity({
      ip: ip,
      action: "Un-Authorized Login",
      description: `Un-Authorized Login attempt at ${moment().format("DD-MM-YYYY HH:mm:ss")} - Tried Username : ${username}`,
    })
    .save();
}

export const login = (platform) => {
  return asyncErrorHandler(async (req, res) => {
    const { username, password, rememberMe, error, deviceId } = await logInBodyValidation(req.body);

    const userAgent = req.headers["user-agent"];
    const deviceDetector = new DeviceDetector();
    const device = deviceDetector.parse(userAgent);

    let deviceInfo = {
      browser: device?.client?.name ?? "",
      os: device?.os?.name ?? "",
      platform: device?.os?.platform ?? "",
      deviceType: device?.device?.type ?? "",
    };

    if (error) throw new Error(error, 400);
    let static_error = "Invalid credentials. Check your username or password.";

    if (platform === "web") {
      const loginAttempt = await models.LoginAttempt.findOne({
        $or: [{ login_ip: req.ip }, { username: username }],
      }).sort({ createdAt: -1 });

      let user = await models.User.findOne({ username });

      // <<======= check if user is block =======>>
      if (loginAttempt && loginAttempt.status === 2) {
        if (!loginAttempt.unblock_at) throw new Error("Your account is blocked. Please contact your administrator", 403);

        if (loginAttempt.unblock_at && moment().isBefore(loginAttempt.unblock_at)) {
          throw new Error(`Too many failed attempts. Try again after ${moment(loginAttempt.unblock_at).fromNow()}`, 403);
        } else {
          if (user) {
            user.status = 0;
            await user.save();
          }
          loginAttempt.status = 0;
          loginAttempt.unblock_at = null;
          await loginAttempt.save();
        }
      }

      // <<======= Suspicious login =======>>
      if (isNull(user)) {
        await loginAttemptFunc(loginAttempt, req.ip, username);

        throw new Error(static_error, 403);
      }

      if (user?.status != 0) {
        throw new Error("Your account is blocked!");
      }

      // <<======= validate password =======>>
      let isPasswordValid = user.validatePassword(password, user.password);

      if (!isPasswordValid) {
        await loginAttemptFunc(loginAttempt, req.ip, username, user);
        throw new Error(static_error, 403);
      }

      if (loginAttempt) {
        loginAttempt.login_ip = req.ip;
        loginAttempt.attempts = 0;
        loginAttempt.unblock_at = null;
        await loginAttempt.save();
      }

      if (isNull(user?.twoFactor?.secret) && user?.twoFactor?.enabled) {
        const otpUrl = await qrcode.toDataURL(secret.otpauth_url);
        user.twoFactor.qrCode = otpUrl;
        user.twoFactor.secret = secret.ascii;
        await user.save();
      }

      user = user.toObject();
      delete user.password;
      delete user.date;
      delete user.time;
      delete user.__v;
      delete user?.twoFactor?.secret;
      delete user?.twoFactor?.lastUsedOTP;

      const { accessToken, refreshToken } = await generateTokens(user, rememberMe, deviceId, deviceInfo);

      res.cookie("token", accessToken, {
        secure: true,
        sameSite: "none",
      });

      if (!user.twoFactor.enabled) {
        res.cookie("refresh-token", refreshToken, {
          secure: true,
          sameSite: "none",
          ...(rememberMe ? { maxAge: 30 * 24 * 60 * 60 * 1000 } : {}),
        });
      }

      return new Response("Login successful", { data: decodeAndEncode(user), accessToken }, 200);
    } else {
      throw new Error("Invalid platform", 400);
    }
  });
};

export const allowed = asyncErrorHandler(async (req) => {
  let user = req.user;
  let privilege = req.privilege;
  let modules = null;

  let privilegeInfo = await models.Privilege.findById(privilege);

  if (privilegeInfo?.superAdmin) {
    modules = await models.Modules.aggregate([
      {
        $match: { status: 0 },
      },
      {
        $lookup: {
          from: "mainMenus",
          let: { moduleId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$module", "$$moduleId"],
                    },
                    { $eq: ["$status", 0] },
                  ],
                },
              },
            },
          ],
          as: "mainMenus",
        },
      },
      {
        $lookup: {
          from: "subMenus",
          let: { mainMenuIds: "$mainMenus._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ["$mainMenu", "$$mainMenuIds"],
                    },
                    { $eq: ["$status", 0] },
                  ],
                },
              },
            },
            {
              $addFields: {
                order: { $ifNull: ["$order", 999] },
              },
            },
            {
              $project: {
                title: "$name",
                mainMenu: 1,
                path: 1,
                icon: 1,
                order: 1,
                type: "item",
              },
            },
          ],
          as: "subMenus",
        },
      },
      {
        $addFields: {
          mainMenus: {
            $map: {
              input: "$mainMenus",
              as: "menu",
              in: {
                $let: {
                  vars: {
                    matchedSubMenus: {
                      $filter: {
                        input: "$subMenus",
                        as: "sub",
                        cond: {
                          $eq: ["$$sub.mainMenu", "$$menu._id"],
                        },
                      },
                    },
                  },
                  in: {
                    _id: "$$menu._id",
                    title: "$$menu.name",
                    icon: "$$menu.icon",
                    path: "$$menu.path",
                    order: {
                      $ifNull: ["$$menu.order", 999],
                    },
                    subMenus: "$$matchedSubMenus",
                    type: {
                      $cond: {
                        if: {
                          $gt: [
                            {
                              $size: "$$matchedSubMenus",
                            },
                            0,
                          ],
                        },
                        then: "collapse",
                        else: "item",
                      },
                    },
                    divider: "$$menu.divider",
                    titleMenu: "$$menu.titleMenu",
                    defaultOpen: "$$menu.defaultOpen",
                  },
                },
              },
            },
          },
        },
      },
      {
        $addFields: {
          mainMenus: {
            $sortArray: {
              input: "$mainMenus",
              sortBy: { order: 1 },
            },
          },
        },
      },
      {
        $project: {
          id: "$_id",
          title: "$name",
          path: 1,
          code: 1,
          type: "root",
          Icon: "$icon",
          order: { $ifNull: ["$order", 999] },
          redirectUrl: 1,
          childs: {
            $map: {
              input: "$mainMenus",
              as: "menu",
              in: {
                _id: "$$menu._id",
                title: "$$menu.title",
                icon: "$$menu.icon",
                path: "$$menu.path",
                order: "$$menu.order",
                titleMenu: "$$menu.titleMenu",
                defaultOpen: "$$menu.defaultOpen",
                type: "$$menu.type",
                divider: "$$menu.divider",
                childs: {
                  $sortArray: {
                    input: "$$menu.subMenus",
                    sortBy: { order: 1 },
                  },
                },
              },
            },
          },
        },
      },
      {
        $sort: {
          order: 1,
          updatedAt: 1,
        },
      },
    ]);
  } else {
    modules = await models.Privilege.aggregate([
      {
        $match: {
          _id: ObjectId(privilege),
        },
      },
      {
        $project: {
          alloted_modules: {
            $filter: {
              input: "$alloted_modules",
              as: "module",
              cond: { $eq: ["$$module.status", true] },
            },
          },
          alloted_main_menus: 1,
          alloted_submenus: 1,
        },
      },
      {
        $lookup: {
          from: "modules",
          localField: "alloted_modules.id",
          foreignField: "_id",
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$status", 0] },
              },
            },
          ],
          as: "modules",
        },
      },
      { $unwind: "$modules" },
      {
        $lookup: {
          from: "mainMenus",
          let: {
            mainMenuIds: "$alloted_main_menus.id",
            moduleId: "$modules._id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $in: ["$_id", "$$mainMenuIds"],
                    },
                    {
                      $eq: ["$module", "$$moduleId"],
                    },
                    { $eq: ["$status", 0] },
                    { $eq: ["$masterPath", false] },
                  ],
                },
              },
            },
            {
              $addFields: {
                order: { $ifNull: ["$order", 999] },
              },
            },
            { $sort: { order: 1, time: 1 } },
          ],
          as: "mainMenus",
        },
      },
      {
        $lookup: {
          from: "subMenus",
          let: { subMenuIds: "$alloted_submenus.id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $in: ["$_id", "$$subMenuIds"] }, { $eq: ["$status", 0] }, { $eq: ["$masterPath", false] }],
                },
              },
            },
            {
              $addFields: {
                order: { $ifNull: ["$order", 999] },
              },
            },
            { $sort: { order: 1, time: 1 } },
          ],
          as: "subMenus",
        },
      },
      {
        $addFields: {
          mainMenus: {
            $map: {
              input: "$mainMenus",
              as: "menu",
              in: {
                $let: {
                  vars: {
                    matchedSubMenus: {
                      $filter: {
                        input: {
                          $map: {
                            input: {
                              $filter: {
                                input: "$subMenus",
                                as: "sub",
                                cond: {
                                  $eq: ["$$sub.mainMenu", "$$menu._id"],
                                },
                              },
                            },
                            as: "sub",
                            in: {
                              _id: "$$sub._id",
                              title: "$$sub.name",
                              path: "$$sub.path",
                              icon: "$$sub.icon",
                              order: {
                                $ifNull: ["$$sub.order", 999],
                              },
                              permissions: {
                                $arrayElemAt: [
                                  {
                                    $filter: {
                                      input: "$alloted_submenus",
                                      as: "aSub",
                                      cond: {
                                        $eq: ["$$aSub.id", "$$sub._id"],
                                      },
                                    },
                                  },
                                  0,
                                ],
                              },
                            },
                          },
                        },
                        as: "s",
                        cond: {
                          $eq: ["$$s.permissions.view", true],
                        },
                      },
                    },
                  },
                  in: {
                    _id: "$$menu._id",
                    title: "$$menu.name",
                    path: "$$menu.path",
                    icon: "$$menu.icon",
                    order: {
                      $ifNull: ["$$menu.order", 999],
                    },
                    type: {
                      $cond: {
                        if: {
                          $gt: [
                            {
                              $size: "$$matchedSubMenus",
                            },
                            0,
                          ],
                        },
                        then: "collapse",
                        else: "item",
                      },
                    },
                    childs: {
                      $sortArray: {
                        input: "$$matchedSubMenus",
                        sortBy: { order: 1 },
                      },
                    },
                    permissions: {
                      $arrayElemAt: [
                        {
                          $filter: {
                            input: "$alloted_main_menus",
                            as: "aMenu",
                            cond: {
                              $eq: ["$$aMenu.id", "$$menu._id"],
                            },
                          },
                        },
                        0,
                      ],
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $project: {
          id: "$modules._id",
          title: "$modules.name",
          path: "$modules.path",
          code: "$modules.code",
          Icon: "$modules.icon",
          type: "root",
          redirectUrl: "$modules.redirectUrl",
          order: { $ifNull: ["$modules.order", 999] },
          updatedAt: "$modules.updatedAt",
          childs: "$mainMenus",
        },
      },
      {
        $sort: {
          order: 1,
          updatedAt: 1,
        },
      },
    ]);
  }

  let obj = decodeAndEncode({ user, modules });

  return new Response(
    "Allowed",
    {
      data: obj,
    },
    200
  );
});

export const logout = asyncErrorHandler(async (req, res) => {
  let { device } = req.query;

  if (device === "all") {
    await models.UserToken.deleteMany({
      userId: req.user?._id,
      // "x-refresh-token": { $exists: false },
    });
  } else if (!checkObjectIdValid(device)) {
    await models.UserToken.findOneAndDelete({
      userId: req.user?._id,
      deviceId: req.deviceId,
      // "x-refresh-token": { $exists: false },
    });
  }

  if (checkObjectIdValid(device)) {
    await models.UserToken.findOneAndDelete({
      _id: device,
      // "x-refresh-token": { $exists: false },
    });
  }

  if (device === "all" && !checkObjectIdValid(device)) {
    res.cookie("token", "", { expires: new Date(0) });
    res.clearCookie("token");
    res.cookie("refresh-token", "", { expires: new Date(0) });
    res.clearCookie("refresh-token");
  }

  return res.status(200).json({ message: "logout successful" });
});

export const verifyTwoFactor = asyncErrorHandler(async (req, res) => {
  try {
    const details = jwt.verify(req.cookies.token, ACCESS_TOKEN_SECRET);

    const { token, rememberMe } = req.body;
    if (isNull(token)) throw new Error("Please enter a otp", 400);

    if (!details?._id) throw new Error("User not found.", 404);

    const user = await models.User.findById(details._id);
    if (!user) throw new Error("User not found", 404);

    const secret = user?.twoFactor?.secret;

    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: "ascii",
      token,
    });

    if (!verified) {
      throw new Error("Invalid Otp Code", 400);
    }

    //? update last used token , timestamp and clearing qrCode
    if (verified) {
      await models.User.updateOne(
        { _id: user?._id },
        {
          $set: {
            "twoFactor.used": true,
            "twoFactor.lastUsedOTP": token,
            "twoFactor.lastUsed": moment().format(),
          },
          $unset: {
            "twoFactor.qrCode": "",
          },
        }
      );

      const refreshToken = await models.UserToken.findOne({ deviceId: details?.deviceId, userId: details?._id });

      if (!refreshToken) {
        throw new Error("Unauthorized access.", 401);
      }

      res.cookie("refresh-token", refreshToken.token, {
        secure: true,
        sameSite: "none",
        ...(rememberMe ? { maxAge: 30 * 24 * 60 * 60 * 1000 } : {}),
      });

      return new Response("Two auth successful", null, 200);
    }
  } catch (error) {
    if (error.name === "TokenExpiredError") throw new Error("Your session has been expired", 401);
    else throw new Error(error.message, 401);
  }
});

export const listSessions = asyncErrorHandler(async (req) => {
  let data = await models.UserToken.aggregate([
    {
      $match: {
        userId: ObjectId(req.user?._id),
        blacklisted: false,
        "x-refresh-token": { $exists: false },
      },
    },
    {
      $sort: { _id: -1 },
    },
    {
      $project: {
        _id: 1,
        os: { $ifNull: ["$os", "Unkown"] },
        platform: { $ifNull: ["$platform", "--"] },
        deviceType: {
          $ifNull: ["$deviceType", "--"],
        },
        browser: { $ifNull: ["$browser", "--"] },
        deviceId: 1, // needed for $facet filtering
        icon: {
          $switch: {
            branches: [
              {
                case: {
                  $eq: [{ $toLower: "$os" }, "windows"],
                },
                then: "FaDesktop",
              },
              {
                case: {
                  $eq: [{ $toLower: "$os" }, "mac"],
                },
                then: "FaApple",
              },
              {
                case: {
                  $eq: [{ $toLower: "$os" }, "linux"],
                },
                then: "FaLinux",
              },
              {
                case: {
                  $eq: [{ $toLower: "$os" }, "android"],
                },
                then: "FaAndroid",
              },
              {
                case: {
                  $eq: [{ $toLower: "$os" }, "ios"],
                },
                then: "FaMobileAlt",
              },
            ],
            default: "FaQuestion",
          },
        },
      },
    },
    {
      $facet: {
        currentSession: [
          {
            $match: {
              deviceId: req.deviceId,
            },
          },
        ],
        otherSessions: [
          {
            $match: {
              deviceId: {
                $ne: req.deviceId,
              },
            },
          },
        ],
      },
    },
    {
      $project: {
        currentSession: {
          $map: {
            input: "$currentSession",
            as: "item",
            in: {
              os: "$$item.os",
              platform: "$$item.platform",
              deviceType: "$$item.deviceType",
              browser: "$$item.browser",
              icon: "$$item.icon",
            },
          },
        },
        otherSessions: {
          $map: {
            input: "$otherSessions",
            as: "item",
            in: {
              _id: "$$item._id",
              os: "$$item.os",
              platform: "$$item.platform",
              deviceType: "$$item.deviceType",
              browser: "$$item.browser",
              icon: "$$item.icon",
            },
          },
        },
      },
    },
  ]);
  return new Response("Session", { data: data[0] ?? {} }, 200);
});

export const changePassword = asyncErrorHandler(async (req) => {
  let userId = req.user?._id;

  let payload = await ChangePasswordSchema(req.body);
  if (payload.error) {
    throw new Error(payload.error, 400);
  }

  let { currentPassword, newPassword } = payload;

  let user = await models.User.findOne({ _id: userId, status: 0 });

  if (!user) {
    throw new Error("Invalid User", 404);
  }

  let isPasswordValid = user.validatePassword(currentPassword, user.password);

  if (!isPasswordValid) {
    throw new Error("Current password is incorrect", 400);
  }

  user.password = user.generatePasswordHash(newPassword);
  user.save();

  return new Response("Password changed successful", null, 200);
});
export default app;
