import { asyncErrorHandler, Response } from "express-error-catcher";

import { paginationValues } from "../helper/functions.js";
import { COLLECTIONS } from "../config.js";

import models from "../models/index.js";

export const list = asyncErrorHandler(async (req) => {
  let { from, to, head, subHead, chartOfAccount, user, branchType, mainBranch, subBranch, franchise, collectionCenter } = req.query;
  const condition = {};

  if (!isNull(from)) condition.date = { $gte: from };
  if (!isNull(to)) condition.date = { ...condition.date, $lte: to };

  if (!isNull(head)) condition.head = ObjectId(head);
  if (!isNull(subHead)) condition.subHead = ObjectId(subHead);

  if (!isNull(chartOfAccount))
    condition.chartOfAccount = ObjectId(chartOfAccount);

  if (!isNull(user)) condition.addedBy = ObjectId(user);

  if (!isNull(branchType) || !isNull(req.branchType))
    condition.branchType = !isNull(branchType)
      ? Number(branchType)
      : req.branchType;
  
  if (!isNull(mainBranch) || !isNull(req.branch))
    condition.mainBranch = !isNull(mainBranch) ? mainBranch : req.branch;

  if (!isNull(subBranch) || !isNull(req.subBranch))
    condition.subBranch = !isNull(subBranch) ? subBranch : req.subBranch;

  if (!isNull(franchise) || !isNull(req.franchise))
    condition.franchise = !isNull(franchise) ? franchise : req.franchise;

  if (!isNull(collectionCenter) || !isNull(req.collectionCenter))
    condition.collectionCenter = !isNull(collectionCenter)
      ? collectionCenter
      : req.collectionCenter;
  
  if (!req.isAdmin) {
    if (isNull(req.branch) && isNull(req.subBranch) && isNull(req.franchise) && isNull(req.collectionCenter)) throw new Error("You have no permission to this resource", 400);
    if (req.userType == 1) {
      condition.branchType = 1
    } else if (req.userType == 2) {
      condition.branchType = 2
    } else if (req.userType == 3) {
      condition.branchType = 3
    } else if (req.userType == 4) {
      condition.branchType = 4
    }
  }

  const { skip, limit } = paginationValues(req.query);

  const count = await models.TransactionLog.countDocuments(condition);

  const data = await models.TransactionLog.find(
    condition,
    "date type time uniqueId amount balance remarks branchType"
  )
    .populate("head", "name")
    .populate("subHead", "name")
    .populate("chartOfAccount", "name")
    .populate("mainBranch", "name")
    .populate("subBranch", "name")
    .populate("franchise", "name")
    .populate("collectionCenter", "name")
    .populate("addedBy", { name: CONCAT_NAME })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return new Response("Success", { count, data }, 200);
});

export const userOptions = asyncErrorHandler(async (req) => {
  let { from, to, head, subHead, chartOfAccount, branchType, mainBranch, subBranch, franchise, collectionCenter } = req.query;

  const condition = {};

  if (!isNull(from)) condition.date = { $gte: from };
  if (!isNull(to)) condition.date = { ...condition.date, $lte: to };

  if (!isNull(head)) condition.head = ObjectId(head);
  if (!isNull(subHead)) condition.subHead = ObjectId(subHead);
  if (!isNull(chartOfAccount)) condition.chartOfAccount = ObjectId(chartOfAccount);

  if (!isNull(branchType) || !isNull(req.branchType))
    condition.branchType = !isNull(branchType)
      ? Number(branchType)
      : Number(req.branchType);
  
  if (!isNull(mainBranch) || !isNull(req.branch))
    condition.mainBranch = !isNull(mainBranch) ? ObjectId(mainBranch) : ObjectId(req.branch);

  if (!isNull(subBranch) || !isNull(req.subBranch))
    condition.subBranch = !isNull(subBranch) ? ObjectId(subBranch) : ObjectId(req.subBranch);

  if (!isNull(franchise) || !isNull(req.franchise))
    condition.franchise = !isNull(franchise) ? ObjectId(franchise) : ObjectId(req.franchise);

  if (!isNull(collectionCenter) || !isNull(req.collectionCenter))
    condition.collectionCenter = !isNull(collectionCenter)
      ? ObjectId(collectionCenter)
      : ObjectId(req.collectionCenter);

  if (!req.isAdmin) {
    if (isNull(req.branch) && isNull(req.subBranch) && isNull(req.franchise) && isNull(req.collectionCenter)) throw new Error("You have no permission to this resource", 400);
    if (req.userType == 1) {
      condition.branchType = 1
    } else if (req.userType == 2) {
      condition.branchType = 2
    } else if (req.userType == 3) {
      condition.branchType = 3
    } else if (req.userType == 4) {
      condition.branchType = 4
    }
  }
console.log(condition)
  const data = await models.TransactionLog.aggregate([
    { $match: condition },
    { $group: { _id: "$addedBy" } },
    { $lookup: { from: COLLECTIONS.USERS, localField: "_id", foreignField: "_id", as: "data" } },
    { $unwind: "$data" },
    {
      $project: {
        value: "$_id",
        label: {
          $concat: [{ $ifNull: ["$data.firstName", ""] }, " ", { $ifNull: ["$data.lastName", ""] }],
        },
        userType: "$data.type"
      },
    },
  ]);

  return new Response("Success", { data }, 200);
});

export const chartOfAccountOptions = asyncErrorHandler(async (req) => {
  let { from, to, head, user, branchType, mainBranch, subBranch, franchise, collectionCenter } = req.query;

  const condition = {};

  if (!isNull(from)) condition.date = { $gte: from };
  if (!isNull(to)) condition.date = { ...condition.date, $lte: to };

  if (!isNull(head)) condition.head = ObjectId(head);
  if (!isNull(user)) condition.addedBy = ObjectId(user);

  if (!isNull(branchType) || !isNull(req.branchType))
    condition.branchType = !isNull(branchType)
      ? Number(branchType)
      : Number(req.branchType);
  
  if (!isNull(mainBranch) || !isNull(req.branch))
    condition.mainBranch = !isNull(mainBranch) ? ObjectId(mainBranch) : ObjectId(req.branch);

  if (!isNull(subBranch) || !isNull(req.subBranch))
    condition.subBranch = !isNull(subBranch) ? ObjectId(subBranch) : ObjectId(req.subBranch);

  if (!isNull(franchise) || !isNull(req.franchise))
    condition.franchise = !isNull(franchise) ? ObjectId(franchise) : ObjectId(req.franchise);

  if (!isNull(collectionCenter) || !isNull(req.collectionCenter))
    condition.collectionCenter = !isNull(collectionCenter)
      ? ObjectId(collectionCenter)
      : ObjectId(req.collectionCenter);

  if (!req.isAdmin) {
    if (isNull(req.branch) && isNull(req.subBranch) && isNull(req.franchise) && isNull(req.collectionCenter)) throw new Error("You have no permission to this resource", 400);
    if (req.userType == 1) {
      condition.branchType = 1
    } else if (req.userType == 2) {
      condition.branchType = 2
    } else if (req.userType == 3) {
      condition.branchType = 3
    } else if (req.userType == 4) {
      condition.branchType = 4
    }
  }

  const data = await models.TransactionLog.aggregate([
    { $match: condition },
    { $group: { _id: "$chartOfAccount" } },
    { $sort: { _id: -1 } },
    {
      $lookup: {
        from: COLLECTIONS.CHART_OF_ACCOUNT,
        localField: "_id",
        foreignField: "_id",
        as: "data",
      },
    },
    { $unwind: "$data" },
    { $project: { value: "$_id", label: "$data.name" } },
  ]);

  return new Response("Success", { data }, 200);
});

export const accountHeadOptions = asyncErrorHandler(async (req) => {
  let { from, to, user, chartOfAccount, branchType, mainBranch, subBranch, franchise, collectionCenter } = req.query;

  const condition = {};

  if (!isNull(from)) condition.date = { $gte: from };
  if (!isNull(to)) condition.date = { ...condition.date, $lte: to };

  if (!isNull(chartOfAccount)) condition.chartOfAccount = ObjectId(chartOfAccount);
  if (!isNull(user)) condition.addedBy = ObjectId(user);

  if (!isNull(branchType) || !isNull(req.branchType))
    condition.branchType = !isNull(branchType)
      ? Number(branchType)
      : Number(req.branchType);
  
  if (!isNull(mainBranch) || !isNull(req.branch))
    condition.mainBranch = !isNull(mainBranch) ? ObjectId(mainBranch) : ObjectId(req.branch);

  if (!isNull(subBranch) || !isNull(req.subBranch))
    condition.subBranch = !isNull(subBranch) ? ObjectId(subBranch) : ObjectId(req.subBranch);

  if (!isNull(franchise) || !isNull(req.franchise))
    condition.franchise = !isNull(franchise) ? ObjectId(franchise) : ObjectId(req.franchise);

  if (!isNull(collectionCenter) || !isNull(req.collectionCenter))
    condition.collectionCenter = !isNull(collectionCenter)
      ? ObjectId(collectionCenter)
      : ObjectId(req.collectionCenter);

  if (!req.isAdmin) {
    if (isNull(req.branch) && isNull(req.subBranch) && isNull(req.franchise) && isNull(req.collectionCenter)) throw new Error("You have no permission to this resource", 400);
    if (req.userType == 1) {
      condition.branchType = 1
    } else if (req.userType == 2) {
      condition.branchType = 2
    } else if (req.userType == 3) {
      condition.branchType = 3
    } else if (req.userType == 4) {
      condition.branchType = 4
    }
  }

  const data = await models.TransactionLog.aggregate([
    { $match: condition },
    { $group: { _id: "$head" } },
    {
      $lookup: {
        from: COLLECTIONS.ACCOUNT_HEAD,
        localField: "_id",
        foreignField: "_id",
        as: "data",
      },
    },
    { $unwind: "$data" },
    { $project: { value: "$_id", label: "$data.name" } },
  ]);

  return new Response("Success", { data }, 200);
});
export const accountSubHeadOptions = asyncErrorHandler(async (req) => {
  let { from, to, user, chartOfAccount, branchType, mainBranch, subBranch, franchise, collectionCenter ,head} = req.query;

  const condition = {};

  if (!isNull(from)) condition.date = { $gte: from };
  if (!isNull(to)) condition.date = { ...condition.date, $lte: to };

  if (!isNull(chartOfAccount)) condition.chartOfAccount = ObjectId(chartOfAccount);
  if (!isNull(head)) condition.head = ObjectId(head);
  if (!isNull(user)) condition.addedBy = ObjectId(user);

  if (!isNull(branchType) || !isNull(req.branchType))
    condition.branchType = !isNull(branchType)
      ? Number(branchType)
      : Number(req.branchType);
  
  if (!isNull(mainBranch) || !isNull(req.branch))
    condition.mainBranch = !isNull(mainBranch) ? ObjectId(mainBranch) : ObjectId(req.branch);

  if (!isNull(subBranch) || !isNull(req.subBranch))
    condition.subBranch = !isNull(subBranch) ? ObjectId(subBranch) : ObjectId(req.subBranch);

  if (!isNull(franchise) || !isNull(req.franchise))
    condition.franchise = !isNull(franchise) ? ObjectId(franchise) : ObjectId(req.franchise);

  if (!isNull(collectionCenter) || !isNull(req.collectionCenter))
    condition.collectionCenter = !isNull(collectionCenter)
      ? ObjectId(collectionCenter)
      : ObjectId(req.collectionCenter);

  if (!req.isAdmin) {
    if (isNull(req.branch) && isNull(req.subBranch) && isNull(req.franchise) && isNull(req.collectionCenter)) throw new Error("You have no permission to this resource", 400);
    if (req.userType == 1) {
      condition.branchType = 1
    } else if (req.userType == 2) {
      condition.branchType = 2
    } else if (req.userType == 3) {
      condition.branchType = 3
    } else if (req.userType == 4) {
      condition.branchType = 4
    }
  }

  const data = await models.TransactionLog.aggregate([
    { $match: condition },
    { $group: { _id: "$head" } },
    {
      $lookup: {
        from: COLLECTIONS.ACCOUNT_SUB_HEAD,
        localField: "_id",
        foreignField: "_id",
        as: "data",
      },
    },
    { $unwind: "$data" },
    { $project: { value: "$_id", label: "$data.name" } },
  ]);

  return new Response("Success", { data }, 200);
});
