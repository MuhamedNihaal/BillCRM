import { asyncErrorHandler, Response, Error } from "express-error-catcher";
import models from "@/models/index.js";
import { getQueryArray, querySearchSanitize } from "@/helper/queryRequest.js";;

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
