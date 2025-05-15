import { asyncErrorHandler, Response, Error } from "express-error-catcher";
import moment from "moment";
import Counter from "../helper/counter.js";

import {
  checkObjectIdValid,
  existedValue,
  paginationValues,
  validateSpaceAndLetters,
} from "../helper/functions.js";
import models from "../models/index.js";
import { userSchema } from "../utils/validation.yup.js";

export const listUserActivityLog = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { skip, limit } = paginationValues(req.query);

  let condition = { userId, show: true };

  let count = await models.UserActivity.countDocuments(condition);
  let data = await models.UserActivity.find(condition)
    .lean()
    .sort({ createdAt: -1 })
    .select("-__v -createdAt -updatedAt -_id")
    .skip(skip)
    .limit(limit);
  return new Response(null, { count, data }, 200);
});

export const getUserInfo = asyncErrorHandler(async (req, res) => {
  let data = await models.User.findById(req.user?._id).select(
    "-password -createdAt -updatedAt -__v"
  );
  return new Response(null, { data }, 200);
});

export const addUser = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let userName = req?.user?.firstName ?? req.user?.username;

  let payload = await userSchema(req.body);

  let { type, branch, collectionCenter, company, username, module, privilege } =
    payload;

  if (payload.error) {
    throw new Error(payload.error, 400);
  }

  let isValidModule = await models.Modules.findOne({
    _id: module,
    status: 0,
  });
  if (isNull(isValidModule)) throw new Error("invalid module id provided", 400);

  if (type === 5) {
    let isValidCompany = await models.Company.findOne({
      _id: company,
      status: 0,
    });
    if (!isValidCompany)
      throw new Error("provided company id is not valid", 400);
  }

  if (type === 1 || type === 2 || type === 3) {
    let isValidBranch = await models.Branch.findOne({
      status: 0,
      type,
      _id: branch,
    });

    if (!isValidBranch) {
      throw new Error("provided branch id is not valid", 400);
    }

    if (type === 2) {
      payload.subBranch = branch;
      delete payload.branch;
    }

    if (type === 3) {
      payload.franchise = branch;
      delete payload.branch;
    }
  }

  if (type === 4) {
    let isValidCollection = await models.CollectionCenter.findOne({
      status: 0,
      _id: collectionCenter,
    });
    if (!isValidCollection) {
      throw new Error("provided collection center id is not valid", 400);
    }
  }

  let isValidPrivilege = await models.Privilege.findOne({ _id: privilege });
  if (isNull(isValidPrivilege)) {
    throw new Error("Invalid privilege id provided", 400);
  }

  let isValidUsername = await models.User.findOne({
    username: username,
    status: 0,
  });

  if (!isNull(isValidUsername)) {
    throw new Error("Entered username already in use", 400);
  }

  const counter = new Counter("users");
  payload.uniqueId = await counter.uniqueId("USR", "");
  counter.save();

  let user = await models.User(payload).save();
  user.password = user.generatePasswordHash(user.password);
  user.save();

  await models
    .UserActivity({
      ip: req.ip,
      action: "New User Added",
      user: userName,
      userId: userId,
      description: `User '${username}' has been added by '${userName}'`,
    })
    .save();
  return new Response(
    "successful user added",
    { data: { _id: user?._id } },
    200
  );
});

export const updateUser = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let userName = req?.user?.firstName ?? req.user?.username;

  let payload = existedValue(await userSchema(req.body, false));

  let { username, module, privilege, error } = payload;

  let { other } = req.query;
  if (!isNull(other) && !checkObjectIdValid(other)) {
    throw new Error("Invalid user id provided", 400);
  }

  if (error) throw new Error(error, 400);

  let isValidModule = await models.Modules.findOne({ _id: module, status: 0 });
  if (!isNull(module) && isNull(isValidModule)) {
    throw new Error("invalid module id provided", 400);
  }

  let isValidPrivilege = await models.Privilege.findOne({ _id: privilege });
  if (!isNull(privilege) && isNull(isValidPrivilege)) {
    throw new Error("Invalid privilege id provided", 400);
  }

  let isValidUsername = await models.User.findOne({ username });

  if (!isNull(isValidUsername)) {
    throw new Error("Entered username already in use", 400);
  }

  let superAdmin = await models.Privilege.findOne({
    _id: req.privilege,
    superAdmin: true,
  });

  delete payload.error;

  if (!isNull(other) && isNull(superAdmin)) {
    await models
      .UserActivity({
        ip: req.ip,
        action: "Un-Authorized Profile Update Try",
        user: userName,
        show: false,
        userId: userId,
        description: `'${userName}' attempted to access '${req?.originalUrl}' and update other user profile`,
      })
      .save();

    throw new Error("You are not authorized to perform this action.", 403);
  }

  await models.User.findByIdAndUpdate(other ?? userId, payload);

  await models
    .UserActivity({
      ip: req.ip,
      action: "User Profile Updated",
      user: userName,
      userId: userId,
      description: `User '${payload?.username}' has been updated by '${userName}'`,
    })
    .save();

  return new Response("User profile update successfully", null, 200);
});

export const uploadImage = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let userName = req?.user?.firstName ?? req.user?.username;

  let { other } = req.query;
  let file = req.file;
  if (isNull(file)) throw new Error("file not uploaded try again later", 400);
  let uploaded = file.destination.replace("public/", "") + "/" + file.filename;

  if (!isNull(other) && !checkObjectIdValid(other)) {
    throw new Error("Invalid user id provided", 400);
  }

  let superAdmin = await models.Privilege.findOne({
    _id: req.privilege,
    superAdmin: true,
  });

  if (!isNull(other) && isNull(superAdmin)) {
    await models
      .UserActivity({
        ip: req.ip,
        action: "Un-Authorized Profile Update Try",
        user: userName,
        show: false,
        userId: userId,
        description: `'${userName}' attempted to access '${req?.originalUrl}' and update other user profile image`,
      })
      .save();

    throw new Error("You are not authorized to perform this action.", 403);
  }

  await models.User.findByIdAndUpdate(other ?? userId, { image: uploaded });

  return new Response("Image uploaded successfully", null, 200);
});

export const listUser = asyncErrorHandler(async (req, res) => {
  let { skip, limit } = paginationValues(req.query);
  let { search } = req.query;
  let condition = { status: 0 };

  if (!isNull(search)) {
    condition.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { username: { $regex: search, $options: "i" } },
      { mobile: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  let count = await models.User.countDocuments(condition);
  let data = await models.User.find(condition)
    .lean()
    .populate("module", OPTIONS_FIELD)
    .populate("privilege", OPTIONS_FIELD)
    .populate("company", OPTIONS_FIELD)
    .populate("branch", OPTIONS_FIELD)
    .populate("subBranch", OPTIONS_FIELD)
    .populate("franchise", OPTIONS_FIELD)
    .populate("collectionCenter", OPTIONS_FIELD)
    .sort({ createdAt: -1 })
    .select("-password -createdAt -updatedAt -__v")
    .skip(skip)
    .limit(limit);

  return new Response(null, { count, data }, 200);
});
