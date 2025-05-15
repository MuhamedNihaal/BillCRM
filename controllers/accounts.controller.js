import { asyncErrorHandler, Error, Response } from "express-error-catcher";
import models from "../models/index.js";
import { getDate, getTime, userActivity } from "../helper/functions.js";

export const addHead = asyncErrorHandler(async (req) => {
  let { name } = req.body;
  name = name?.trim();

  if (isNull(name)) throw new Error("Invalid name", 400);

  const exists = await models.AccountHead.findOne({ status: 0, name });
  if (exists) throw new Error("Name already exists", 400);

  await models.AccountHead({ ip: req.ip, addedBy: req.user._id, updatedBy: req.user._id, name }).save();

  userActivity(req, "Account Head created", `Account Head '${name}' created by ${req.user?.username || ""}`);

  return new Response("Account Head added successfully", null, 200);
});

export const updateHead = asyncErrorHandler(async (req) => {
  let { id, name } = req.body;
  name = name?.trim();

  if (isNull(id)) throw new Error("No data found", 400);
  if (isNull(name)) throw new Error("Invalid name", 400);

  const exists = await models.AccountHead.findOne({ _id: { $ne: id }, status: 0, name });
  if (exists) throw new Error("Name already exists", 400);

  const update = { updatedBy: req.user._id, upDate: getDate(), upTime: getTime(), name };
  const data = await models.AccountHead.findByIdAndUpdate(id, update);
  if (!data) throw new Error("No data found", 400);

  userActivity(req, "Account Head updated", `Account Head '${data.name}' updated by ${req.user?.username || ""}`);

  return new Response("Account Head updated successfully", null, 200);
});

export const deleteHead = asyncErrorHandler(async (req) => {
  const id = req.query.id;

  const data = await models.AccountHead.findByIdAndUpdate(id, { status: 1 });

  userActivity(req, "Account Head deleted", `Account Head '${data.name}' deleted by ${req.user?.username || ""}`);

  return new Response("Account Head deleted successfully", null, 200);
});

export const addSubHead = asyncErrorHandler(async (req) => {
  let { name, head } = req.body;
  name = name?.trim();

  if (isNull(name)) throw new Error("Invalid name", 400);
  if (isNull(head)) throw new Error("Account head required", 400);

  const exists = await models.AccountSubHead.findOne({ status: 0, name });
  if (exists) throw new Error("Name already exists", 400);

  await models.AccountSubHead({ ip: req.ip, addedBy: req.user._id, updatedBy: req.user._id, name, head }).save();

  userActivity(req, "Account Sub Head created", `Account Sub Head '${name}' created by ${req.user?.username || ""}`);

  return new Response("Sub Head added successfully", null, 200);
});

export const updateSubHead = asyncErrorHandler(async (req) => {
  let { id, name, head } = req.body;
  name = name?.trim();

  if (isNull(name)) throw new Error("Invalid name", 400);
  if (isNull(head)) throw new Error("Account head required", 400);

  const exists = await models.AccountSubHead.findOne({ _id: { $ne: id }, status: 0, name });
  if (exists) throw new Error("Name already exists", 400);

  const update = { updatedBy: req.user._id, upDate: getDate(), upTime: getTime(), name, head };

  const data = await models.AccountSubHead.findByIdAndUpdate(id, update);
  if (!data) throw new Error("No data found", 400);

  userActivity(req, "Account Sub Head updated", `Account Sub Head '${name}' updated by ${req.user?.username || ""}`);

  return new Response("Sub Head updated successfully", null, 200);
});

export const deleteSubHead = asyncErrorHandler(async (req) => {
  const id = req.query.id;

  const data = await models.AccountSubHead.findByIdAndUpdate(id, { status: 1 });
  if (!data) throw new Error("No data found", 400);

  userActivity(req, "Account Head deleted", `Account Head '${data.name}' deleted by ${req.user?.username || ""}`);
  return new Response("Account Sub Head deleted successfully", null, 200);
});

export const headList = asyncErrorHandler(async (req) => {
  const condition = { status: 0 };

  const data = await models.AccountHead.find(condition, "date time name")
    .populate("addedBy", { name: CONCAT_NAME })
    .sort({ createdAt: -1 });

  return new Response("Success", { data }, 200);
});

export const subHeadList = asyncErrorHandler(async (req) => {
  let { head } = req.query;
  const condition = { status: 0 };
  if (!isNull(head)) condition.head = head
  
  const data = await models.AccountSubHead.find(condition, "date time name")
    .populate("head", OPTIONS_FIELD)
    .populate("addedBy", { name: CONCAT_NAME })
    .sort({ createdAt: -1 });

  return new Response("Success", { data }, 200);
});
