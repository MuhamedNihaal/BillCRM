import { asyncErrorHandler, Response, Error } from "express-error-catcher";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import DeviceDetector from "device-detector-js";

//============> Local Import
import * as config from "@/config/index.js";
import getPublicUser from "@/utils/getPublicUser.js";
import { changePasswordSchema, loginSchema } from "@/validation/auth.validation.js";
import models from "@/models/index.js";
import loginAttemptFunc from "@/utils/loginAttemptFunc.js";
import { generateToken, handleJwtError, verifyToken } from "@/utils/tokenHandler.js";
import { checkObjectIdValid, decodeAndEncode, isSame } from "@/helper/index.js";
import getTimeParam from "@/utils/getTimeParam.js";
import { splitTokenAndRot } from "@/utils/splitToken.js";
import COLLECTIONS from "@/config/collections.js";
import userActivity, { ACTIVITY_ACTIONS } from "@/utils/userActivity.js";

const secretGenerate = (name = null) => {
  let label = name ? `NOBLE - CRM: ${name}` : `NOBLE - CRM`;
  return speakeasy.generateSecret({
    name: label,
  });
};

export const login = asyncErrorHandler(async (req) => {
  let payload = await loginSchema(req.body);

  const userAgent = req.headers["user-agent"];
  const deviceDetector = new DeviceDetector();
  const device = deviceDetector.parse(userAgent);

  const deviceInfo = {
    browser: device?.client?.name ?? "",
    os: device?.os?.name ?? "",
    platform: device?.os?.platform ?? "",
    deviceType: device?.device?.type ?? "",
  };

  const static_error = "Invalid credentials. Check your username or password.";

  let loginAttempt = await models.LoginAttempt.findOne({ username: payload.username }).sort({ createdAt: -1 });

  let user = await models.User.findOne({
    $or: [{ username: payload.username }, { email: payload.username }],
    status: { $ne: 1 },
  });

  console.log(user);

  //? <<======= check if user is block =======>>
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
      loginAttempt.login_on = moment().format("YYYY-MM-DD HH:mm:ss");
      loginAttempt.unblock_at = null;
      await loginAttempt.save();
    }
  } else {
    const isThereAnyUserBlockWithIp = await models.LoginAttempt.findOne({
      login_ip: req.ip,
      status: 2,
    }).lean();

    if (isThereAnyUserBlockWithIp && isThereAnyUserBlockWithIp.unblock_at && moment().isBefore(isThereAnyUserBlockWithIp.unblock_at)) {
      throw new Error(`Too many failed attempts. Try again after ${moment(isThereAnyUserBlockWithIp.unblock_at).fromNow()}`, 403);
    }
  }

  if (isNull(user)) {
    await loginAttemptFunc({ loginAttempt, req, username: payload.username });

    throw new Error(static_error, 403);
  }

  // <<======= validate password =======>>
  let isPasswordValid = user.validatePassword(payload.password, user.password ?? "");

  if (!isPasswordValid) {
    await loginAttemptFunc({ loginAttempt, req, username: payload.username, user });
    throw new Error(static_error, 403);
  }

  if (loginAttempt) {
    loginAttempt.login_ip = req.ip;
    loginAttempt.attempts = 0;
    loginAttempt.unblock_at = null;
    await loginAttempt.save();
  }

  if (isNull(user?.twoFactor?.secret) && user?.twoFactor?.enabled) {
    let secret = secretGenerate(user?.username);

    const otpUrl = await qrcode.toDataURL(secret.otpauth_url, {
      color: {
        dark: "#000000",
        light: "#00000000",
      },
    });
    user.twoFactor.qrCode = otpUrl;
    user.twoFactor.secret = secret.ascii;
    await user.save();
  }

  user = getPublicUser(user);

  let { accessToken, refreshToken, accessTokenSplit, socketToken } = await generateToken({
    user,
    deviceInfo: { ...deviceInfo, deviceId: payload.deviceId },
    rememberMe: payload.rememberMe,
    ip: req.ip,
    platform: "crm",
  });

  let data = {};

  if (user.twoFactor.enabled) {
    let tempToken = decodeAndEncode(accessToken);

    data = { tempToken: tempToken, twoFa: true };

    if (user?.twoFactor?.qrCode) data.qrcode = user.twoFactor.qrCode;
    else data.used = true;

    return new Response("Login successful - Complete two step", { data }, 200);
  }

  req.user = user;

  await userActivity({
    req,
    action: ACTIVITY_ACTIONS.AUTH.USER_LOGIN,
    description: `${user.username} logged [ reference ID: ${payload.deviceId} ]`,
  });

  data = { refresh: refreshToken, ...accessTokenSplit, socketToken };

  if (!config.production) {
    data.Authorization = `Bearer ${Object.entries(accessTokenSplit)
      .map(([key, value]) => `${key}=${value}`)
      .join("; ")}`;
  }

  return new Response("Login successful", { data }, 200);
});

export const verifyTwoFactor = asyncErrorHandler(async (req) => {
  try {
    let otp = req.body?.otp || null;
    let temp_token = decodeAndEncode(req?.cookie?.tempToken || req.headers["x-temp-token"], false);

    let details = verifyToken({ token: temp_token, type: "access", platform: "crm" });

    if (isNull(otp)) throw new Error("Please enter a otp", 400);

    const user = await models.User.findById(details.id).lean();
    if (!user) throw new Error("User not found", 404);

    const secret = user?.twoFactor?.secret;

    const verified = speakeasy.totp.verify({
      secret: secret,
      encoding: "ascii",
      token: otp,
    });

    if (!verified) {
      throw new Error("Invalid Otp Code", 400);
    }

    await models.User.updateOne(
      { _id: user?._id },
      {
        $set: {
          "twoFactor.used": true,
          "twoFactor.lastUsedOTP": otp,
          "twoFactor.lastUsed": getTimeParam("dateAndTimeWithSecond"),
        },
        $unset: {
          "twoFactor.qrCode": "",
        },
      }
    );

    const refreshToken = await models.UserTokens.findOne({ deviceId: details.deviceId, user: user._id, production: config.production }).lean();
    if (!refreshToken) {
      throw new Error("Unauthorized access.", 401, { removeLogin: true });
    }

    req.user = getPublicUser(user);
    
    await userActivity({
      req,
      action: ACTIVITY_ACTIONS.AUTH.USER_LOGIN,
      description: `${user?.username} completed mfa and logged [ reference ID: ${refreshToken.deviceId} ]`,
    });

    return new Response(
      "Two auth successful",
      {
        data: {
          refresh: refreshToken.token,
          ...splitTokenAndRot(temp_token),
        },
      },
      200
    );
  } catch (error) {
    handleJwtError(error, { removeLogin: true });
  }
});

export const renewAccessToken = asyncErrorHandler(async (req) => {
  const _accessToken = req?.cookies?.token || req.headers["x-access-token"];

  if (_accessToken) {
    try {
      await verifyToken({ token: _accessToken, type: "access", platform: "crm" });

      return new Response("Access token already valid", null, 200);
    } catch (error) {
      console.log("refresh token generation - > continue... ");
    }
  }

  try {
    const _refreshToken = req?.cookies?.["refresh-token"] || req.headers["x-refresh-token"];

    if (!_refreshToken) throw new Error("Login again", 401, { tokenErr: true });

    let isValidRefreshToken = verifyToken({ token: _refreshToken, type: "refresh", platform: "crm" });

    let rememberMe = isValidRefreshToken.exp - isValidRefreshToken.iat === 604800 ? false : true;

    let tokenData = await models.UserTokens.findOne(
      { token: _refreshToken, production: config.production },
      {
        _id: 0,
        os: 1,
        platform: 1,
        deviceType: 1,
        deviceId: 1,
        browser: 1,
      }
    ).lean();

    if (!tokenData) throw new Error("Login again", 401, { tokenErr: true });

    let { refreshToken, accessTokenSplit, socketToken } = await generateToken({
      user: { _id: isValidRefreshToken.id },
      deviceInfo: tokenData,
      rememberMe: rememberMe,
      ip: req.ip,
      refresh: _refreshToken,
      platform: "crm",
    });

    // req.session.tokenGenerated = getTimeParam("dateAndTime");
    // await new Promise((resolve) => req.session.save(resolve));

    let data = { rememberMe, refresh: refreshToken, ...accessTokenSplit, socketToken };

    if (!config.production) {
      data.Authorization = `Bearer ${Object.entries(accessTokenSplit)
        .map(([key, value]) => `${key}=${value}`)
        .join("; ")}`;
    }

    return new Response("Access token renewed", { data }, 200);
  } catch (error) {
    if (error?.data?.tokenErr || error?.tokenErr) {
      throw new Error("Your session has expired. Please log in again to continue.", 401, { removeRefreshToken: true });
    }

    throw new Error(error.message, error.statusCode ?? 400);
  }
});

export const allowed = asyncErrorHandler(async (req) => {
  let user = req.user;
  let privilegeId = ObjectId(req.privilege);

  const modules = await models.PrivilegePermission.aggregate([
    {
      $match: {
        type: 1,
        privilege: privilegeId,
        enabled: true,
      },
    },

    //? all modules with active status
    {
      $lookup: {
        from: COLLECTIONS.MODULES,
        localField: "module",
        foreignField: "_id",
        as: "data",
      },
    },
    { $unwind: "$data" },
    {
      $match: {
        "data.status": 0,
      },
    },
    { $sort: { "data.order": 1 } },

    {
      //? main menus with active status
      $lookup: {
        from: COLLECTIONS.PRIVILEGES_PERMISSION,
        let: { moduleId: "$data._id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $eq: ["$privilege", privilegeId] }, { $eq: ["$module", "$$moduleId"] }, { $eq: ["$view", true] }],
              },
              type: 2,
            },
          },
          {
            $lookup: {
              from: COLLECTIONS.MAIN_MENUS,
              localField: "mainMenu",
              foreignField: "_id",
              as: "mData",
            },
          },
          { $unwind: "$mData" },
          {
            $match: {
              "mData.status": 0,
            },
          },
          { $sort: { "mData.order": 1 } },

          {
            //? sub menu with active status
            $lookup: {
              from: COLLECTIONS.PRIVILEGES_PERMISSION,
              let: { mainMenuId: "$mData._id" },
              pipeline: [
                {
                  $match: {
                    $expr: {
                      $and: [{ $eq: ["$privilege", privilegeId] }, { $eq: ["$mainMenu", "$$mainMenuId"] }, { $eq: ["$view", true] }],
                    },
                    type: 3,
                  },
                },
                {
                  $lookup: {
                    from: COLLECTIONS.SUB_MENUS,
                    localField: "subMenu",
                    foreignField: "_id",
                    as: "sData",
                  },
                },
                { $unwind: "$sData" },
                {
                  $match: {
                    "sData.status": 0,
                  },
                },
                { $sort: { "sData.order": 1 } },
                {
                  $project: {
                    id: "$sData.id",
                    title: "$sData.name",
                    path: "$sData.path",
                    code: "$sData.code",
                    icon: "$sData.icon",
                    domains: "$sData.domains",
                    permissions: {
                      enabled: "$enabled",
                      create: "$create",
                      view: "$view",
                      edit: "$edit",
                      remv: "$remv",
                    },
                  },
                },
              ],
              as: "subData",
            },
          },

          {
            $project: {
              permissions: {
                enabled: "$enabled",
                create: "$create",
                view: "$view",
                edit: "$edit",
                remv: "$remv",
              },
              id: "$mData.id",
              title: "$mData.name",
              path: "$mData.path",
              code: "$mData.code",
              icon: "$mData.icon",
              domains: "$mData.domains",

              divider: "$mData.divider",
              group: "$mData.group",
              titleMenu: "$mData.titleMenu",

              childs: "$subData",
              type: {
                $cond: {
                  if: {
                    $gt: [
                      {
                        $size: "$subData",
                      },
                      0,
                    ],
                  },
                  then: "collapse",
                  else: "item",
                },
              }, // item, collapse
              order: { $ifNull: ["$mData.order", 999] },
            },
          },
        ],
        as: "childs",
      },
    },

    {
      $project: {
        _id: "$data._id",
        id: "$data._id",
        title: "$data.name",
        path: "$data.path",
        code: "$data.code",
        Icon: "$data.icon",
        domains: "$data.domains",
        type: "root",
        order: { $ifNull: ["$data.order", 999] },
        childs: 1,
      },
    },
  ]);

  let _encrypted = decodeAndEncode({ modules, user });

  return new Response("Allowed", { data: _encrypted }, 200);
});

export const logout = asyncErrorHandler(async (req) => {
  let { device } = req.query;

  if (device === "all") {
    await models.UserTokens.deleteMany({
      user: req.user._id,
    });
  } else if (!checkObjectIdValid(device)) {
    await models.UserTokens.findOneAndDelete({
      user: req.user?._id,
      deviceId: req.deviceId,
    });
  } else if (checkObjectIdValid(device)) {
    await models.UserTokens.findOneAndDelete({
      _id: device,
    });
  }

  req.session.destroy();
  return new Response("logout successful", null, 200);
});

export const listSessions = asyncErrorHandler(async (req) => {
  let data = await models.UserTokens.aggregate([
    {
      $match: {
        user: ObjectId(req.user?._id),
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
        deviceId: 1,
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

  let payload = await changePasswordSchema(req.body);

  let { currentPassword, newPassword } = payload;

  let user = await models.User.findOne({ _id: userId, status: 0 });

  if (!user) {
    throw new Error("Invalid User", 404);
  }

  const isPasswordValid = user.validatePassword(currentPassword, user.password);
  if (!isPasswordValid) {
    throw new Error("Current password is incorrect", 400);
  }

  const newPasswordHash = user.generatePasswordHash(newPassword);

  const isOldSameAsNewPassword = user.validatePassword(newPassword, user.password);

  if (isOldSameAsNewPassword) {
    throw new Error("New password cannot be same as old password", 400);
  }

  user.password = newPasswordHash;
  await user.save();

  await userActivity({
    req,
    action: ACTIVITY_ACTIONS.AUTH.USER_PASSWORD_CHANGE,
    description: `User password changed by {userName}. [ reference ID: ${user.uniqueId} ]`,
  });

  return new Response("Password changed successful", null, 200);
});
