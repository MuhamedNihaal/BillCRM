import { asyncErrorHandler, Error, Response } from "express-error-catcher";
import moment from "moment";

import { getDate, getTime, paginationValues, userActivity } from "../helper/functions.js";
import models from "../models/index.js";
import Counter from "../helper/counter.js";

export const add = asyncErrorHandler(async (req) => {
  let { name, subHead, balance, branch, collectionCenter } = req.body;
  name = name?.trim();

  if (isNull(name)) throw new Error("Invalid name", 404);
  if (isNull(subHead)) throw new Error("Sub Head required", 404);

  const condition = { name, status: 0, subHead };

  const exists = await models.ChartOfAccount.findOne(condition);
  if (exists) throw new Error("Name already exists", 404);

  const subHeadData = await models.AccountSubHead.findOne({ _id: subHead, status: 0 });
  if (isNull(subHeadData)) throw new Error("Sub Head not found", 400);

  branch = branch || req.branch || req.subBranch || req.franchise || null;
  collectionCenter = collectionCenter || req.collectionCenter || null;

  let company
  if (branch) {
    company = await models.Branch.findById(branch).lean();
  } else if (collectionCenter) {
    company = await models.CollectionCenter.findById(collectionCenter).lean();
  }

  const counter = new Counter("chartOfAccount");
  const uniqueId = await counter.uniqueId("CA", moment().format("MMYY"));
  counter.save();

  await models
    .ChartOfAccount({
      name,
      subHead,
      balance,
      uniqueId,
      head: subHeadData.head,
      branch,
      collectionCenter,
      company: company?.company ?? null,

      ip: req.ip,
      addedBy: req.user._id,
      updatedBy: req.user._id,
    })
    .save();

  userActivity(
    req,
    "Chart Of Account added",
    `Chart of account '${name}' added by ${req.user.username || ""}`
  );

  return new Response("Chart Of Account added successfully", null, 200);
});

export const update = asyncErrorHandler(async (req) => {
  let { id, name, subHead, branch, collectionCenter } = req.body;
  name = name?.trim();

  if (isNull(name)) throw new Error("Invalid name", 404);
  if (isNull(subHead)) throw new Error("Sub Head required", 404);

  const condition = { _id: { $ne: id }, name, status: 0, subHead };
  const exists = await models.ChartOfAccount.findOne(condition);
  if (exists) throw new Error("Name already exists", 404);

  const subHeadData = await models.AccountSubHead.findOne({ _id: subHead, status: 0 });
  if (isNull(subHeadData)) throw new Error("Sub Head not found", 400);

  branch = branch || req.branch || req.subBranch || req.franchise || null;
  collectionCenter = collectionCenter || req.collectionCenter || null;

  let company
  if (branch) {
    company = await models.Branch.findById(branch).lean();
  } else if (collectionCenter) {
    company = await models.CollectionCenter.findById(collectionCenter).lean();
  }

  const update = {
    name,
    subHead,
    head: subHeadData.head,
    branch,
    collectionCenter,
    company: company?.company ?? null,
    updatedBy: req.user._id,
    upDate: getDate(),
    upTime: getTime(),
  };
  const data = await models.ChartOfAccount.findByIdAndUpdate(id, update);
  if (!data) throw new Error("No Data found", 400);

  userActivity(
    req,
    "Chart Of Account updated",
    `Chart of account '${data.uniqueId}' updated by ${req.user.username || ""}`
  );

  return new Response("Chart Of Account updated successfully", null, 200);
});

export const deleteAccount = asyncErrorHandler(async (req) => {
  const id = req.query.id;
  const data = await models.ChartOfAccount.findByIdAndUpdate(id, { status: 1 });
  if (!data) throw new Error("No Data found", 400);

  userActivity(
    req,
    "Chart Of Account deleted",
    `Chart of account '${data.uniqueId}' deleted by ${req.user.username || ""}`
  );

  return new Response("Chart Of Account deleted successfully", null, 200);
});

export const list = asyncErrorHandler(async (req) => {
  const { head, subHead } = req.query;
  const condition = { status: 0 };

  if (!isNull(head)) condition.head = ObjectId(head);
  if (!isNull(subHead)) condition.subHead = ObjectId(subHead);

  const count = await models.ChartOfAccount.countDocuments(condition);
  const data = await models.ChartOfAccount.find(condition, "name date time balance uniqueId")
    .populate("addedBy", { name: CONCAT_NAME })
    .populate("head", OPTIONS_FIELD)
    .populate("subHead", OPTIONS_FIELD)
    .populate("branch", OPTIONS_FIELD)
    .populate("collectionCenter", OPTIONS_FIELD)
    .sort({ _id: -1 })
    .lean();
  return new Response("Success", { count, data }, 200);
});
