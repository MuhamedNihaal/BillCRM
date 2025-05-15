import { asyncErrorHandler, Response, Error } from "express-error-catcher";
import moment from "moment";
import { paginationValues } from "../helper/functions.js";
import models from "../models/index.js";

export const listUserActivityLog = asyncErrorHandler(async (req, res) => {
  let { skip, limit } = paginationValues(req.query);
  let { userId, from, to, search } = req.query;
  let condition = {};

  if (!isNull(userId)) condition.userId = userId;

  if (!isNull(from) || !isNull(to)) {
    condition.date = {};
  }

  if (!isNull(search)) {
    condition.$or = [
      { ip: { $regex: search, $options: "i" } },
      { action: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
    ];
  }

  if (!isNull(from)) condition.date.$gte = from;
  if (!isNull(to)) condition.date.$lte = to;

  console.log(skip, limit);
  let count = await models.UserActivity.countDocuments(condition);
  let data = await models.UserActivity.find(condition)
    .select("-__v -createdAt -updatedAt -_id")
    .skip(skip)
    .limit(limit)
    .sort({ createdAt: -1 })
    .lean();
  return new Response(null, { count, data }, 200);
});

export const listBlockedIp = asyncErrorHandler(async (req, res) => {
  let { skip, limit } = paginationValues(req.query);
  let { search, from, to, status } = req.query;
  let condition = {};

  if (!isNull(search)) {
    condition.$or = [{ username: { $regex: search, $options: "i" } }, { ip: { $regex: search, $options: "i" } }];
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
    .select("-__v -createdAt -updatedAt -_id -unblock_at")
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

  await models.LoginAttempt.findOneAndUpdate(
    { username },
    {
      status,
      attempts: 0,
      unblock_at: moment().format("YYYY-MM-DD HH:mm:ss"),
    }
  );

  await models.User.findOneAndUpdate({ username }, { status });

  return new Response(`${username} ${type == 1 ? "blocked" : "unblocked"}`, null, 200);
});
