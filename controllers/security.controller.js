import { asyncErrorHandler, Response, Error } from "express-error-catcher";

import { paginationValues } from "@/helper/index.js";
import models from "@/models/index.js";
import getTimeParam from "@/utils/getTimeParam.js";

export const listUserActivityLog = asyncErrorHandler(async (req, res) => {
  let { skip, limit } = paginationValues(req.query);
  let { userId, from, to, search, action } = req.query;
  let condition = {};

  if (!isNull(userId)) condition.userId = userId;

  if (!isNull(from) || !isNull(to)) {
    condition.date = {};
  }

  if (!isNull(action)) condition.action = action;

  if (!isNull(search)) {
    condition.$or = [
      { ip: { $regex: search, $options: "i" } },
      { action: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (!isNull(from)) condition.date.$gte = from;
  if (!isNull(to)) condition.date.$lte = to;

  let count = await models.UserActivity.countDocuments(condition);
  let data = await models.UserActivity.find(condition)
    .select("-__v -createdAt -updatedAt -_id")
    .populate("user", USER_BY)
    .skip(skip)
    .limit(limit)
    .sort({ _id: -1 })
    .lean();
  return new Response("activity log list", { count, data }, 200);
});

export const userActivityActions = asyncErrorHandler(async (req, res) => {
  const actions = await models.UserActivity.distinct("action");

  return new Response(null, { data: actions }, 200);
});

export const listBlockedIp = asyncErrorHandler(async (req, res) => {
  let { skip, limit } = paginationValues(req.query);
  let { search, from, to, status } = req.query;
  let condition = {};

  if (!isNull(search)) {
    condition.$or = [{ username: { $regex: search, $options: "i" } }, { login_ip: { $regex: search, $options: "i" } }];
  }

  if (!isNull(from) || !isNull(to)) {
    condition.date = {};
  }

  if (!isNull(status) && ["0", "1", "2"].includes(status)) {
    if (status == 1) status = 0;
    condition.status = Number(status);
  }

  if (!isNull(from)) condition.date.$gte = from;
  if (!isNull(to)) condition.date.$lte = to;

  let count = await models.LoginAttempt.countDocuments(condition);
  let data = await models.LoginAttempt.find(condition)
    .lean()
    .sort({ createdAt: -1 })
    .select("-__v -createdAt -updatedAt -_id")
    .skip(skip)
    .limit(limit);
  return new Response(null, { count, data }, 200);
});

export const removeBlock = asyncErrorHandler(async (req, res) => {
  let { username, type } = req.body; // type = 1 - block, 2 - unblock
  if (isNull(username)) throw new Error("please provide username", 400);
  if (isNull(type)) throw new Error("please provide type", 400);

  let status = 0;

  if (type == 1) {
    status = 2;
  }

  let obj = {
    status,
    attempts: 0,
    unblock_at: null,
  };

  if (status == 2) {
    obj.time = getTimeParam("timeWithSecond");
    obj.date = getTimeParam("date");
  }

  await models.LoginAttempt.findOneAndUpdate({ username }, obj);

  await models.User.findOneAndUpdate({ username }, { status });

  return new Response(`${username} ${type == 1 ? "blocked" : "unblocked"}`, null, 200);
});
