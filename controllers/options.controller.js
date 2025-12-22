import { asyncErrorHandler, Response, Error } from "express-error-catcher";
import models from "@/models/index.js";
import { getQueryArray, querySearchSanitize } from "@/helper/queryRequest.js";
import { ACCOUNT_HEAD, ACCOUNT_SUBHEAD } from "@/config/finance.js";

//! Common Routes
export const countries = asyncErrorHandler(async () => {
  const data = await models.Country.find({}, Object.freeze({ name: "$name", label: "$name", value: "$_id", _id: "$id" }))
    .lean()
    .sort({ name: 1 });
  return new Response(null, { data }, 200);
});

export const states = asyncErrorHandler(async (req) => {
  const condition = { countryId: 101 };

  if (req.query.country) condition.countryId = req.query.country;

  const data = await models.State.find(condition, OPTIONS_FIELD).lean().sort({ name: 1 });

  return new Response(null, { data }, 200);
});

export const districts = asyncErrorHandler(async (req) => {
  const condition = { status: 0 };

  let state = getQueryArray(req, "state");

  if (!isNull(state) || state.length > 0) {
    condition.state = { $in: state };
  }

  const data = await models.District.find(condition, OPTIONS_FIELD).lean().sort({ name: 1 });

  return new Response(null, { data }, 200);
});

//! Main Routes
export const department = asyncErrorHandler(async (req) => {
  let condition = { status: 0 };

  let { search, all, branch: branchQ, subBranch, franchise } = req.query;

  let branchId = req.branch || req.subBranch || req.franchise || branchQ || subBranch || franchise;

  let branch = await models.Branch.findById(branchId).select("department");

  if (branch && all !== "true") condition._id = { $in: branch?.department };

  if (!isNull(search)) {
    search = querySearchSanitize(search);
    condition.$or = [{ name: { $regex: search, $options: "i" } }, { code: { $regex: search, $options: "i" } }];
  }

  let data = await models.Department.find(condition, OPTIONS_FIELD).limit(100).sort({ name: 1 });
  return new Response(null, { data }, 200);
});

//! Core Routes
export const user = asyncErrorHandler(async (req) => {
  let { type, branch, subBranch, franchise, collectionCenter, department } = req.query;
  let condition = { status: 0 };
  if (type == "1") {
    condition = {};
  }

  if (branch) condition.branch = branch;
  if (subBranch) condition.subBranch = subBranch;
  if (franchise) condition.franchise = franchise;
  if (collectionCenter) condition.collectionCenter = collectionCenter;
  if (department) condition.department = department;

  let data = await models.User.find(condition, OPTIONS_FIELD);
  return new Response(null, { data }, 200);
});

export const privilege = asyncErrorHandler(async (req) => {
  const { user = false } = req.query;

  let data = null;
  const condition = { status: 0 };

  if (user) {
    const users = await models.User.find({ status: { $ne: 1 } }).distinct("privilege");
    if (users.length > 0) condition._id = { $in: users };
  }

  data = await models.Privilege.find(condition, OPTIONS_FIELD);

  return new Response(null, { data }, 200);
});

export const module = asyncErrorHandler(async (req) => {
  const { privilege } = req.query;

  const condition = { status: 0 };

  if (!isNull(privilege)) {
    const details = await models.PrivilegePermission.find({ type: 1, privilege, enabled: true }).distinct("module");
    condition._id = { $in: details };
  }

  let data = await models.Modules.find(condition, OPTIONS_FIELD);

  return new Response(null, { data }, 200);
});

//! Finance Route

export const accountHead = asyncErrorHandler(async (req) => {
  const condition = { status: 0 };
  const data = await models.AccountHead.find(condition, OPTIONS_FIELD).sort({
    createdAt: -1,
  });

  return new Response("Success", { data }, 200);
});

export const accountSubHead = asyncErrorHandler(async (req) => {
  const condition = { status: 0 };

  const head = getQueryArray(req, "head");

  if (head.length > 0) {
    condition.head = { $in: head };
  }

  const data = await models.AccountSubHead.find(condition, OPTIONS_FIELD).sort({
    createdAt: -1,
  });

  return new Response("Success", { data }, 200);
});

export const chartOfAccount = asyncErrorHandler(async (req) => {
  const condition = { status: 0 };

  const { head, _id } = req.query;
  const branch = req.branch || req.subBranch || req.query.branch || req.query.subBranch || null;
  const collectionCenter = req.collectionCenter || req.franchise || req.query.franchise || req.query.collectionCenter || null;

  const subHead = getQueryArray(req, "subHead");
  if (subHead.length > 0) {
    condition.subHead = { $in: subHead };
  }

  if (!isNull(_id)) condition._id = { $ne: _id };
  if (!isNull(head)) condition.head = head;
  if (!isNull(branch)) condition.branch = branch;
  if (!isNull(collectionCenter)) condition.collectionCenter = collectionCenter;

  if (!req.isAdmin && isNull(branch) && isNull(collectionCenter)) {
    throw new Error("Branch or Collection Center required", 400);
  }

  const data = await models.ChartOfAccount.find(condition, {
    ...OPTIONS_FIELD,
    balance: 1,
  }).sort({ createdAt: -1 });

  return new Response("Success", { data }, 200);
});

export const fundSource = asyncErrorHandler(async (req) => {
  const branch = req.branch || req.subBranch || req.query.branch || req.query.subBranch || null;
  const collectionCenter = req.collectionCenter || req.franchise || req.query.franchise || req.query.collectionCenter || null;

  const condition = {
    status: 0,
    head: ACCOUNT_HEAD.BANK,
    subHead: { $ne: ACCOUNT_SUBHEAD.ONLINE },
  };

  if (!isNull(branch)) condition.branch = branch;
  if (!isNull(collectionCenter)) condition.collectionCenter = collectionCenter;

  if (!req.isAdmin && isNull(branch) && isNull(collectionCenter)) throw new Error("Branch or Collection Center required", 400);

  const data = await models.ChartOfAccount.find(condition, OPTIONS_FIELD).sort({ createdAt: -1 }).limit(150);

  return new Response("Success", { data }, 200);
});
