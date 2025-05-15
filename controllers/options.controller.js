import { asyncErrorHandler, Response, Error } from "express-error-catcher";
import models from "../models/index.js";
import { ACCOUNT_HEAD, ACCOUNT_SUBHEAD, COLLECTIONS } from "../config.js";
import { pipeline } from "stream";

export const module = asyncErrorHandler(async (req) => {
  let data = await models.Modules.find({ status: 0 }, OPTIONS_FIELD);
  return new Response(null, { data }, 200);
});

export const menu = asyncErrorHandler(async (req) => {
  let data = await models.MainMenu.find({ status: 0 }, OPTIONS_FIELD);
  return new Response(null, { data }, 200);
});

export const subMenu = asyncErrorHandler(async (req) => {
  let data = await models.SubMenu.find({ status: 0 }, OPTIONS_FIELD);
  return new Response(null, { data }, 200);
});

export const privilege = asyncErrorHandler(async (req) => {
  let data = await models.Privilege.find({ status: 0, superAdmin: false }, OPTIONS_FIELD);
  return new Response(null, { data }, 200);
});

export const user = asyncErrorHandler(async (req) => {
  let { type } = req.query;
  let condition = { status: 0 };
  if (type == "1") {
    condition = {};
  }

  let data = await models.User.find(condition, OPTIONS_FIELD);
  return new Response(null, { data }, 200);
});

export const company = asyncErrorHandler(async (req) => {
  const condition = { status: 0 };

  const data = await models.Company.find(condition, OPTIONS_FIELD).sort({
    name: 1,
  });

  return new Response("Success", { data }, 200);
});

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
  const { state } = req.query;

  if (!isNull(state)) {
    if (Array.isArray(state)) {
      condition.state = { $in: state };
    } else condition.state = state;
  }

  const data = await models.District.find(condition, OPTIONS_FIELD).lean().sort({ name: 1 });

  return new Response(null, { data }, 200);
});

export const branch = asyncErrorHandler(async (req) => {
  const { company, type } = req.query;
  if (isNull(type)) throw new Error("Branch type required");

  let condition = { status: 0, type: Number(type) };

  if (type == -1) {
    delete condition.type;
  }

  if (!isNull(company)) condition.company = company;

  const data = await models.Branch.find(condition, OPTIONS_FIELD).lean().sort({ name: 1 });

  return new Response(null, { data }, 200);
});

export const collectionCenter = asyncErrorHandler(async (req) => {
  const { company, subBranch, mainBranch } = req.query;

  const condition = { status: 0 };

  if (!isNull(company)) condition.company = company;
  if (!isNull(mainBranch)) condition.mainBranch = mainBranch;
  if (!isNull(subBranch)) condition.subBranch = subBranch;

  const data = await models.CollectionCenter.find(condition, OPTIONS_FIELD).lean().sort({ name: 1 });

  return new Response(null, { data }, 200);
});

export const accountHead = asyncErrorHandler(async (req) => {
  const condition = { status: 0 };
  const data = await models.AccountHead.find(condition, OPTIONS_FIELD).sort({
    createdAt: -1,
  });

  return new Response("Success", { data }, 200);
});

export const accountSubHead = asyncErrorHandler(async (req) => {
  const condition = { status: 0 };

  const { head } = req.query;

  if (!isNull(head)) {
    if (Array.isArray(head)) condition.head = { $in: head };
    else condition.head = head;
  }

  const data = await models.AccountSubHead.find(condition, OPTIONS_FIELD).sort({
    createdAt: -1,
  });

  return new Response("Success", { data }, 200);
});

export const chartOfAccount = asyncErrorHandler(async (req) => {
  const condition = { status: 0 };

  const { subHead, head, _id } = req.query;
  const branch = req.branch || req.subBranch || req.franchise || req.query.branch || null;
  const collectionCenter = req.collectionCenter || req.query.collectionCenter || null;

  if (!isNull(subHead)) {
    if (Array.isArray(subHead)) condition.subHead = { $in: subHead };
    else condition.subHead = subHead;
  }

  if (!isNull(branch)) condition.branch = branch;
  if (!isNull(head)) condition.head = head;
  if (!isNull(_id)) condition._id = { $ne: _id };
  if (!isNull(collectionCenter)) condition.collectionCenter = collectionCenter;

  if (!req.isAdmin && isNull(branch) && isNull(collectionCenter)) throw new Error("Branch or Collection Center required", 400);
  const data = await models.ChartOfAccount.find(condition, {
    ...OPTIONS_FIELD,
    balance: 1,
  }).sort({
    createdAt: -1,
  });

  return new Response("Success", { data }, 200);
});

export const fundSource = asyncErrorHandler(async (req) => {
  const branch = req.branch || req.subBranch || req.franchise || req.query.branch || null;
  const collectionCenter = req.collectionCenter || req.query.collectionCenter || null;

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

export const mainBranch = asyncErrorHandler(async (req) => {
  const { company } = req.query;

  const condition = { status: 0, type: 1 };

  if (!isNull(company)) condition.company = company;

  const data = await models.Branch.find(condition, OPTIONS_FIELD).lean().sort({ name: 1 });

  return new Response(null, { data }, 200);
});

export const subBranch = asyncErrorHandler(async (req) => {
  const { company, mainBranch } = req.query;

  const condition = { status: 0, type: 2 };

  if (!isNull(company)) condition.company = company;
  if (!isNull(mainBranch)) condition.mainBranch = mainBranch;

  const data = await models.Branch.find(condition, OPTIONS_FIELD).lean().sort({ name: 1 });

  return new Response(null, { data }, 200);
});

export const franchise = asyncErrorHandler(async (req) => {
  const { company, mainBranch } = req.query;

  const condition = { status: 0, type: 3 };

  if (!isNull(company)) condition.company = company;
  if (!isNull(mainBranch)) condition.mainBranch = mainBranch;

  const data = await models.Branch.find(condition, OPTIONS_FIELD).lean().sort({ name: 1 });

  return new Response(null, { data }, 200);
});

export const allBranches = asyncErrorHandler(async (req) => {
  let condition = { status: 0 };
  if (!req.isAdmin) {
    condition._id = req.branch || req.subBranch || req.collectionCenter || req.franchise;
  }
  let data = await models.Branch.aggregate([
    {
      $match: condition,
    },
    {
      $sort: { _id: -1 },
    },
    {
      $project: {
        _id: 0,
        label: "$name",
        value: "$_id",
        type: 1,
      },
    },
    {
      $unionWith: {
        coll: COLLECTIONS.COLLECTION_CENTER,
        pipeline: [
          {
            $match: condition,
          },
          {
            $sort: { _id: -1 },
          },
          {
            $project: {
              _id: 0,
              label: "$name",
              value: "$_id",
              type: { $literal: 4 },
            },
          },
        ],
      },
    },
    {
      $group: {
        _id: "$type",
        item: {
          $push: {
            label: "$label",
            value: "$value",
            type: "$type",
          },
        },
      },
    },
    {
      $sort: { _id: 1 },
    },
  ]);

  return new Response(null, { data, isAdmin: req.isAdmin }, 200);
});

export const branchesListingOptions = asyncErrorHandler(async (req) => {
  let condition = { status: 0 };
  if (!isNull(req.query.branchType)) condition.type = Number(req.query.branchType);
  let data = await models.Branch.aggregate([
    {
      $match: condition,
    },
    {
      $sort: { _id: -1 },
    },
    {
      $project: {
        _id: 0,
        label: "$name",
        value: "$_id",
        type: 1,
        status: 1,
      },
    },
    {
      $unionWith: {
        coll: COLLECTIONS.COLLECTION_CENTER,
        pipeline: [
          {
            $match: condition,
          },
          {
            $sort: { _id: -1 },
          },
          {
            $project: {
              _id: 0,
              label: "$name",
              value: "$_id",
              type: { $literal: 4 },
              status: 1,
            },
          },
        ],
      },
    },
    {
      $match: condition,
    },
  ]);

  return new Response(null, { data }, 200);
});
