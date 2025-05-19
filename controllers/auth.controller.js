import { Router } from "express";
import { asyncErrorHandler, Response, Error } from "express-error-catcher";
import { logInBodyValidation } from "../utils/validation.yup.js";
import models from "../models/index.js";
const app = Router();
import moment from "moment";
import { accountOrIpBlocking } from "../utils/rule.js";
import { ACCESS_TOKEN_RES_EXPIRE, OTP_SECRET_KEY } from "../config.js";
import speakeasy from "speakeasy";
import qrcode from "qrcode";
import generateTokens from "../utils/generateUserToken.js";
import { COLLECTIONS } from "../config.js";
import { decodeAndEncode } from "../helper/functions.js";

const secret = speakeasy.generateSecret({
  // name: OTP_SECRET_KEY,
  // name: OTP_SECRET_KEY,
  name: "Template - CRM",
});

const placeHolderReplacer = (message, otp) => {
  return message?.replaceAll(/\{\{(.*?)\}\}/g, otp);
};

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
      description: "Un-Authorized Login Attempt at " + moment().format("DD-MM-YYYY HH:mm:ss") + " - Tried Username :" + username,
    })
    .save();
}

export const login = (platform) => {
  return asyncErrorHandler(async (req, res) => {
    const { username, password, rememberMe, error, deviceId } = await logInBodyValidation(req.body);

    if (error) throw new Error(error, 400);
    let static_error = "Invalid credentials. Check your username or password.";

    if (platform === "web") {
      const loginAttempt = await models.LoginAttempt.findOne({
        $or: [{ login_ip: req.ip }, { username: username }],
      });

      let user = await models.User.findOne({ username });
      // .populate(
      //   "modules",
      //   "moduleName shortCode redirect_url"
      // );

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

      const { accessToken, refreshToken } = await generateTokens(user, rememberMe, deviceId);

      res.cookie("token", accessToken, {
        maxAge: ACCESS_TOKEN_RES_EXPIRE,
        secure: true,
        sameSite: "none",
      });

      return new Response("Login successful", { data: decodeAndEncode(user), refreshToken }, 200);
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
        $match: {
          status: 0,
        },
      },
      {
        $lookup: {
          from: COLLECTIONS.MAIN_MENUS,
          let: { moduleId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [{ $eq: ["$module", "$$moduleId"] }, { $eq: ["$status", 0] }],
                },
              },
            },
          ],
          as: "mainMenus",
        },
      },
      {
        $lookup: {
          from: COLLECTIONS.SUB_MENUS,
          let: { mainMenuIds: "$mainMenus._id" },
          pipeline: [
            {
              $match: {
                $expr: {
                  $in: ["$mainMenu", "$$mainMenuIds"],
                },
                status: 0,
              },
            },
            {
              $addFields: {
                order: { $ifNull: ["$order", 999] },
              },
            },
            {
              $project: {
                name: 1,
                mainMenu: 1,
                link: 1,
                icon: 1,
                order: 1,
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
                _id: "$$menu._id",
                name: "$$menu.name",
                icon: "$$menu.icon",
                link: "$$menu.link",
                order: {
                  $ifNull: ["$$menu.order", 999],
                },
                subMenus: {
                  $filter: {
                    input: "$subMenus",
                    as: "sub",
                    cond: {
                      $eq: ["$$sub.mainMenu", "$$menu._id"],
                    },
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
          name: 1,
          code: 1,
          icon: 1,
          order: {
            $ifNull: ["$order", 999],
          },
          redirectUrl: 1,
          mainMenus: {
            $map: {
              input: "$mainMenus",
              as: "menu",
              in: {
                _id: "$$menu._id",
                name: "$$menu.name",
                icon: "$$menu.icon",
                link: "$$menu.link",
                order: "$$menu.order",
                subMenus: {
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
          alloted_modules: 1,
          alloted_main_menus: 1,
          alloted_submenus: 1,
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
      {
        $unwind: "$modules",
      },
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
                _id: "$$menu._id",
                name: "$$menu.name",
                link: "$$menu.link",
                icon: "$$menu.icon",
                order: {
                  $ifNull: ["$$menu.order", 999],
                },
                permissions: {
                  $arrayElemAt: [
                    {
                      $filter: {
                        input: "$alloted_main_menus",
                        as: "alloted",
                        cond: {
                          $eq: ["$$alloted.id", "$$menu._id"],
                        },
                      },
                    },
                    0,
                  ],
                },
                subMenus: {
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
                          name: "$$sub.name",
                          link: "$$sub.link",
                          icon: "$$sub.icon",
                          permissions: {
                            $arrayElemAt: [
                              {
                                $filter: {
                                  input: "$alloted_submenus",
                                  as: "alloted",
                                  cond: {
                                    $eq: ["$$alloted.id", "$$sub._id"],
                                  },
                                },
                              },
                              0,
                            ],
                          },
                        },
                      },
                    },
                    as: "subMenu",
                    cond: {
                      $eq: ["$$subMenu.permissions.view", true],
                    },
                  },
                },
              },
            },
          },
        },
      },
      {
        $match: {
          "modules.status": { $eq: 0 },
        },
      },
      {
        $project: {
          moduleId: "$modules._id",
          name: "$modules.name",
          icon: "$modules.icon",
          code: "$modules.code",
          redirectUrl: "$modules.redirectUrl",
          mainMenus: 1,
          order: {
            $ifNull: ["$modules.order", 999],
          },
          updatedAt: "$modules.updatedAt",
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
  console.log(req.deviceId);

  await models.UserToken.findOneAndDelete({
    userId: req.user?._id,
    deviceId: req.deviceId,
  });

  res.cookie("token", "", { expires: new Date(0) });
  res.clearCookie("token");
  return res.status(200).json({ message: "logout successful" });
});

export const verifyTwoFactor = asyncErrorHandler(async (req) => {
  const secret = req?.user?.twoFactor?.secret;

  const { token } = req.body;

  if (isNull(token)) throw new Error("Please enter a otp", 400);

  const verified = speakeasy.totp.verify({
    secret: secret,
    encoding: "ascii",
    token,
  });

  //? update last used token , timestamp and clearing qrCode
  if (verified) {
    await models.User.updateOne(
      { _id: req.user._id },
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
  }

  const data = encrypt({ verified });

  return new Response(null, { data }, 200);
});

export default app;
