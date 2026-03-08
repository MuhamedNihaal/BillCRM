import { asyncErrorHandler, Error, Response } from "express-error-catcher";

//! Local Imports
import { checkObjectIdValid, isSame, paginationValues, getQueryArray, Counter } from "@/helper/index.js";
import models from "@/models/index.js";
import { userSchema, userBasicSchema } from "@/validation/user.validation.js";
import userActivity, { ACTIVITY_ACTIONS } from "@/utils/userActivity.js";
import COLLECTIONS from "@/config/collections.js";
import { encryptPassword } from "@/utils/password.js";
import getPublicUser from "@/utils/getPublicUser.js";

//? Browser Token Management
export const getUserBrowserToken = asyncErrorHandler(async (req) => {});
export const userBrowserToken = asyncErrorHandler(async (req) => {});

//? Common Controllers
export const listUserActivityLog = asyncErrorHandler(async (req) => {
  let userId = req.user?._id;
  let { skip, limit, sortBy } = paginationValues(req.query);

  let condition = { userId, show: true };

  let count = await models.UserActivity.countDocuments(condition);
  let data = await models.UserActivity.find(condition).sort(sortBy).select("-__v -createdAt -updatedAt -_id").skip(skip).limit(limit).lean();

  return new Response("User activity Log", { count, data }, 200);
});

export const getUserInfo = asyncErrorHandler(async (req) => {
  let data = await models.User.findById(req.user?._id).select("-password -createdAt -updatedAt -__v");
  return new Response("User Info", { data }, 200);
});

export const basicData = asyncErrorHandler(async (req) => {
  const userId = req.user?._id;

  let payload = await userBasicSchema(req.body);

  const existingUser = await models.User.findOne({
    status: 0,
    _id: { $ne: userId },
    $or: [{ username: payload.username }, { mobile: payload.mobile }, { email: payload.email }],
  }).lean();

  if (existingUser) {
    if (existingUser.username === payload.username) {
      throw new Error("Username already exists", 400);
    }
    if (existingUser.mobile === payload.mobile) {
      throw new Error("Mobile number already exists", 400);
    }
    if (existingUser.email === payload.email) {
      throw new Error("Email already exists", 400);
    }
  }

  await models.User.findByIdAndUpdate(userId, payload);

  await userActivity({
    req,
    action: ACTIVITY_ACTIONS.AUTH.USER_PROFILE_UPDATE,
    description: "User basic details updated",
  });

  return new Response("Profile update successfully", { data: { _id: userId } }, 200);
});

//? Both Controllers
export const deleteUser = asyncErrorHandler(async (req) => {
  let userId = req.user?._id;

  let { other } = req.query;

  if (!isNull(other) && !checkObjectIdValid(other)) {
    throw new Error("Invalid user provided", 400);
  }

  if (!isNull(other) && !req.isAdmin) {
    await userActivity({
      req,
      action: ACTIVITY_ACTIONS.AUTH.ACCOUNT_LOCKED,
      description: `{userName} attempted to update your profile`,
      who: other,
    });

    throw new Error("You are not authorized to perform this action.", 403);
  }

  let updaterId = req.isAdmin ? other : userId;

  let user = await models.User.findById(updaterId, { status: 1, updatedBy: userId });

  await userActivity({
    req,
    action: ACTIVITY_ACTIONS.AUTH.ACCOUNT_LOCKED,
    description: `User account deleted by {userName} [ reference ID: ${user.uniqueId}]`,
    who: req.isAdmin ? other : null,
  });

  return new Response("User Deleted successfully", null, 200);
});

export const uploadProfileImage = asyncErrorHandler(async (req) => {
  let userId = req.user?._id;
  let { other } = req.query;

  let file = req.file;

  if (!isNull(other) && !req.isAdmin) {
    await userActivity({
      req,
      action: ACTIVITY_ACTIONS.AUTH.USER_PROFILE_UPDATE,
      description: `{userName} attempted to update user profile image`,
      who: other,
    });

    throw new Error("You are not authorized to perform this action.", 403);
  }

  await models.User.findByIdAndUpdate(other ?? userId, { image: file.dbPath });

  await userActivity({
    req,
    action: ACTIVITY_ACTIONS.AUTH.USER_PROFILE_UPDATE,
    description: other ? `{userName} updated your profile` : `Your profile updated`,
    who: other ? other : null,
  });

  return new Response("Image uploaded successfully", null, 200);
});

export const userDetails = asyncErrorHandler(async (req) => {
  const data = await models.User.findOne({ uniqueId: req.params.id })
    .populate("privilege", "name")
    .populate("company", "name")
    .populate("branch", "name")
    // .select("-module -twoFactor")
    .lean();

  if (!data) throw new Error("User not found.", 404);

  data = getPublicUser(data);

  return new Response("Specific user", { data }, 200);
});

export const setupMFA = asyncErrorHandler(async (req) => {
  let { status, staffId } = req.body;

  if (!isSame(staffId, req.user._id) && !req.isAdmin) {
    await userActivity({
      req,
      action: ACTIVITY_ACTIONS.AUTH.MFA_ENABLED,
      who: staffId,
      description: `Un-Authorized MFA Update Try by {userName}`,
    });

    throw new Error("You are not authorized to perform this action", 403);
  }

  const user = await models.User.findOneAndUpdate(
    { _id: staffId },
    {
      twoFactor: { enabled: status },
    }
  );

  await userActivity({
    req,
    action: ACTIVITY_ACTIONS.AUTH.MFA_ENABLED,
    description: `User {userName} has ${status ? "enabled" : "disabled"} MFA [ reference ID: ${user.uniqueId} ]`,
    who: staffId,
  });

  return new Response(`MFA has been ${status ? "enabled" : "disabled"} successfully`, null, 200);
});

//? Master Controllers
export const addUser = asyncErrorHandler(async (req) => {
  let payload = await userSchema(req.body);

  let isValidModule = await models.Modules.findOne({
    _id: payload.module,
    status: 0,
  });

  if (isNull(isValidModule)) throw new Error("invalid module id provided", 400);

  let isValidPrivilege = await models.Privilege.findOne({ _id: payload.privilege });
  if (isNull(isValidPrivilege)) {
    throw new Error("Invalid privilege id provided", 400);
  }

  let orConditions = [{ username: payload.username }];

  if (!isNull(payload.mobile)) {
    orConditions.push({ mobile: payload.mobile });
  }

  if (!isNull(payload.email)) {
    orConditions.push({ email: payload.email });
  }

  const existingUser = await models.User.findOne({
    status: 0,
    $or: orConditions,
  }).lean();

  if (existingUser) {
    if (existingUser.username === payload.username) {
      throw new Error("Username already exists", 400);
    }
    if (existingUser.mobile === payload.mobile) {
      throw new Error("Mobile number already exists", 400);
    }
    if (existingUser.email === payload.email) {
      throw new Error("Email already exists", 400);
    }
  }

  const counter = new Counter({ counterId: COLLECTIONS.USERS });

  payload.uniqueId = await counter.uniqueId({ prefix: "USR", identifier: "" });

  payload.password = await encryptPassword(payload.password);

  let user = await new models.User(payload).save();

  userActivity({
    req,
    action: ACTIVITY_ACTIONS.CRUD.CREATE_RECORD,
    description: `User created by {userName} for [ reference ID: ${payload.uniqueId} ]`,
  });

  return new Response("User added successfully", { data: { _id: user._id } }, 200);
});

export const updateUser = asyncErrorHandler(async (req) => {
  let userId = req.user?._id;

  let payload = await userSchema(req.body);

  if (payload.imageReplace) {
    payload.image = "";
  }

  let { other } = req.query;

  if (!isNull(other) && !checkObjectIdValid(other)) {
    throw new Error("Invalid user id provided", 400);
  }

  let isValidModule = await models.Modules.findOne({ _id: payload.module, status: 0 });
  if (!isNull(module) && isNull(isValidModule)) {
    throw new Error("invalid module id provided", 400);
  }

  let isValidPrivilege = await models.Privilege.findOne({ _id: payload.privilege });
  if (!isNull(privilege) && isNull(isValidPrivilege)) {
    throw new Error("Invalid privilege id provided", 400);
  }

  let orConditions = [{ username: payload.username }];

  if (!isNull(payload.mobile)) {
    orConditions.push({ mobile: payload.mobile });
  }

  if (!isNull(payload.email)) {
    orConditions.push({ email: payload.email });
  }

  const existingUser = await models.User.findOne({
    status: 0,
    _id: { $ne: other ?? userId },
    $or: orConditions,
  }).lean();

  if (existingUser) {
    if (existingUser.username === payload.username) {
      throw new Error("Username already exists", 400);
    }
    if (existingUser.mobile === payload.mobile) {
      throw new Error("Mobile number already exists", 400);
    }
    if (existingUser.email === payload.email) {
      throw new Error("Email already exists", 400);
    }
  }

  if (!isNull(other) && !req.isAdmin) {
    await userActivity({
      req,
      action: ACTIVITY_ACTIONS.AUTH.USER_PROFILE_UPDATE,
      description: `{userName} attempted to update user profile`,
      who: other ? other : null,
    });

    throw new Error("You are not authorized to perform this action.", 403);
  }

  let user = await models.User.findByIdAndUpdate(other ?? userId, payload);

  await userActivity({
    req,
    action: ACTIVITY_ACTIONS.AUTH.USER_PROFILE_UPDATE,
    description: `User details has been updated by {userName} [ reference ID: ${user.uniqueId}]`,
    who: other ? other : null,
  });

  return new Response("User updated successfully", null, 200);
});

export const listUser = asyncErrorHandler(async (req) => {
  let { skip, limit, sortBy } = paginationValues(req.query);
  let { search } = req.query;
  let condition = { status: { $ne: 1 } };

  if (!isNull(search)) {
    condition.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } },
      { mobile: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { uniqueId: { $regex: search, $options: "i" } },
    ];
  }

  if (!isNull(req.company)) condition.company = { $in: req.company };

  if (!isNull(req.branch)) condition.branch = { $in: req.branch };

  if (!isNull(req.query.privilege)) condition.privilege = req.query.privilege;

  let privilegeIds = getQueryArray(req, "privilege", ObjectId);

  if (privilegeIds.length > 0) {
    condition.privilege = { $in: privilegeIds };
  }

  let count = await models.User.countDocuments(condition);
  let data = await models.User.find(condition)
    .populate("module", OPTIONS_FIELD)
    .populate("privilege", OPTIONS_FIELD)
    .populate("company", OPTIONS_FIELD)
    .populate("branch", OPTIONS_FIELD)
    // .populate("collectionCenter", OPTIONS_FIELD)
    .sort(sortBy)
    .select("-password -createdAt -updatedAt -__v")
    .skip(skip)
    .limit(limit)
    .lean();

  return new Response("User list", { count, data }, 200);
});

export const userActiveInactive = asyncErrorHandler(async (req) => {
  let { status, staffId } = req.body;

  await models.User.updateOne(
    { _id: staffId },
    {
      status: status ? 0 : 2,
    }
  );

  await userActivity({
    req,
    action: ACTIVITY_ACTIONS.AUTH.USER_PROFILE_UPDATE,
    description: `User {userName} has been ${status ? "activated" : "deactivated"}`,
    who: staffId,
  });

  return new Response("User status updated successfully", null, 200);
});

export const changePassword = asyncErrorHandler(async (req) => {
  let userId = req.body?.id;

  let user = await models.User.findOne({ _id: userId, status: 0 });

  if (!user) {
    throw new Error("Invalid User", 404);
  }

  let superAdmin = await models.Privilege.findOne({
    _id: req.privilege,
    superAdmin: true,
  });

  if (isNull(superAdmin)) {
    await userActivity({
      req,
      action: ACTIVITY_ACTIONS.AUTH.USER_PASSWORD_CHANGE,
      who: userId,
      description: `Un-Authorized Password Change Try:- by {userName}`,
    });

    throw new Error("You are not authorized to perform this action.", 403);
  }

  user.password = user.generatePasswordHash(req.body.password);
  await user.save();

  await userActivity({
    req,
    action: ACTIVITY_ACTIONS.AUTH.USER_PASSWORD_CHANGE,
    description: `User password changed by {userName} for [ reference ID: ${user.uniqueId} ]`,
    who: userId,
  });

  return new Response("Password changed successfully", null, 200);
});

export const updatePrivilege = asyncErrorHandler(async (req) => {
  let { privilege, id } = req.body;

  if (isNull(privilege) || isNull(id)) {
    throw new Error("Privilege and User ID are required", 400);
  }

  if (!checkObjectIdValid(id)) {
    throw new Error("Invalid user ID provided", 400);
  }

  let superAdmin = await models.Privilege.findOne({
    _id: req.privilege,
    superAdmin: true,
  }).lean();

  if (isNull(superAdmin)) {
    await userActivity({
      req,
      action: ACTIVITY_ACTIONS.CRUD.UPDATE_RECORD,
      who: id,
      description: `Un-Authorized Privilege Update Try:- by {userName}`,
    });

    throw new Error("You are not authorized to perform this action.", 403);
  }

  let isValidPrivilege = await models.Privilege.findOne({ _id: privilege });

  if (isNull(isValidPrivilege)) {
    throw new Error("Invalid privilege id provided", 400);
  }

  await models.User.updateOne({ _id: id }, { privilege });

  await userActivity({
    req,
    action: ACTIVITY_ACTIONS.CRUD.UPDATE_RECORD,
    who: id,
    description: `User privilege updated by {userName}`,
  });

  return new Response("User privilege updated successfully", null, 200);
});
