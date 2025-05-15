import { Error, Response, asyncErrorHandler } from "express-error-catcher";
import { COLLECTIONS } from "../config.js";

import models from "../models/index.js";

import { paginationValues } from "../helper/functions.js";

export const incomeExpenseReport = asyncErrorHandler(async (req) => {
  const { type, from, to, subHead, fundSource, chartOfAccount, branchType, mainBranch, subBranch, franchise, collectionCenter } = req.query;
  const condition = { status: { $ne: 1 } };

  if (!isNull(type)) condition.type = Number(type);
  if (!isNull(subHead)) condition.subHead = subHead;
  if (!isNull(fundSource)) condition.fundSource = fundSource;
  if (!isNull(chartOfAccount)) condition.chartOfAccount = chartOfAccount;
  if (!isNull(from)) condition.date = { $gte: from };
  if (!isNull(to)) condition.date = { ...condition.date, $lte: to };

  const { skip, limit } = paginationValues(req.query);

  if (!isNull(branchType) || !isNull(req.branchType)) condition.branchType = Number(branchType) || req.branchType;
  if (!isNull(mainBranch) || !isNull(req.branch)) condition.mainBranch = mainBranch || req.branch;
  if (!isNull(subBranch) || !isNull(req.subBranch)) condition.subBranch = subBranch || req.subBranch;
  if (!isNull(franchise) || !isNull(req.franchise)) condition.franchise = franchise || req.franchise;
  if (!isNull(collectionCenter) || !isNull(req.collectionCenter)) condition.collectionCenter = collectionCenter || req.collectionCenter;

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

  console.log(condition);

  const count = await models.IncomeExpense.countDocuments(condition);
  const data = await models.IncomeExpense.find(condition, "date type amount total remarks branchType")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("subHead", "name")
    .populate("fundSource", "name")
    .populate("chartOfAccount", "name")
    .populate("mainBranch", "name")
    .populate("subBranch", "name")
    .populate("franchise", "name")
    .populate("collectionCenter", "name")
    .populate("addedBy", { name: CONCAT_NAME });

  return new Response("Success", { count, data }, 200);
});

export const profitAndLoss = asyncErrorHandler(async (req) => {
  const { from, to, subHead, branchType, mainBranch, subBranch, franchise, collectionCenter } = req.query;

  if (!req.isAdmin) throw new Error("You don't have permission to access this resourse", 400);
  
  const condition = { status: { $ne: 1 } };
  if (!isNull(from)) condition.date = { $gte: from };
  if (!isNull(to)) condition.date = { ...condition.date, $lte: to };

  if (!isNull(subHead)) {
    if (Array.isArray(subHead)) condition.subHead = { $in: subHead };
    else condition.subHead = subHead;
  }

  if (!isNull(branchType) || !isNull(req.branchType)) condition.branchType = Number(branchType) || req.branchType;
  if (!isNull(mainBranch) || !isNull(req.branch)) condition.mainBranch = mainBranch || req.branch;
  if (!isNull(subBranch) || !isNull(req.subBranch)) condition.subBranch = subBranch || req.subBranch;
  if (!isNull(franchise) || !isNull(req.franchise)) condition.franchise = franchise || req.franchise;
  if (!isNull(collectionCenter) || !isNull(req.collectionCenter)) condition.collectionCenter = collectionCenter || req.collectionCenter;

  const data = await models.IncomeExpense.aggregate([
    { $match: condition },
    {
      $lookup: {
        from: COLLECTIONS.ACCOUNT_SUB_HEAD,
        localField: "subHead",
        foreignField: "_id",
        as: "subHeadDetails",
      },
    },
    {
      $lookup: {
        from: COLLECTIONS.CHART_OF_ACCOUNT,
        localField: "chartOfAccount",
        foreignField: "_id",
        as: "chartOfAccountData",
      },
    },
    {
      $facet: {
        income: [
          { $match: { type: 1 } },
          {
            $group: {
              _id: { subHead: "$subHead", chartOfAccount: "$chartOfAccount" },
              type: { $first: "$type" },
              subHead: { $first: "$subHead" },
              name: { $first: { $arrayElemAt: ["$subHeadDetails.name", 0] } },
              chartOfAccount: { $first: { $arrayElemAt: ["$chartOfAccountData.name", 0] } },
              total: { $sum: "$total" },
              amount: { $sum: "$amount" },
              createdAt: { $last: "$createdAt" },
            },
          },
          { $sort: { createdAt: -1 } },
          {
            $group: {
              _id: "$subHead",
              total: { $sum: "$total" },
              amount: { $sum: "$amount" },
              name: { $first: "$name" },
              createdAt: { $last: "$createdAt" },
              type: { $first: "$type" },
              data: { $push: { name: "$chartOfAccount", total: "$total", amount: "$amount" } },
            },
          },
          { $sort: { createdAt: -1 } },
          {
            $group: {
              _id: "Income",
              total: { $sum: "$total" },
              amount: { $sum: "$amount" },
              type: { $first: "$type" },
              data: { $push: { name: "$name", total: "$total", amount: "$amount", data: "$data" } },
            },
          },
        ],
        expense: [
          { $match: { type: 2 } },
          {
            $group: {
              _id: { subHead: "$subHead", chartOfAccount: "$chartOfAccount" },
              type: { $first: "$type" },
              subHead: { $first: "$subHead" },
              name: { $first: { $arrayElemAt: ["$subHeadDetails.name", 0] } },
              chartOfAccount: { $first: { $arrayElemAt: ["$chartOfAccountData.name", 0] } },
              total: { $sum: "$total" },
              amount: { $sum: "$amount" },
              createdAt: { $last: "$createdAt" },
            },
          },
          { $sort: { createdAt: -1 } },
          {
            $group: {
              _id: "$subHead",
              total: { $sum: "$total" },
              amount: { $sum: "$amount" },
              name: { $first: "$name" },
              type: { $first: "$type" },
              createdAt: { $last: "$createdAt" },
              data: { $push: { name: "$chartOfAccount", total: "$total", amount: "$amount" } },
            },
          },
          { $sort: { createdAt: -1 } },
          {
            $group: {
              _id: "Expense",
              total: { $sum: "$total" },
              amount: { $sum: "$amount" },
              type: { $first: "$type" },
              data: { $push: { name: "$name", total: "$total", amount: "$amount", data: "$data" } },
            },
          },
        ],
      },
    },
    { $project: { combined: { $concatArrays: ["$income", "$expense"] } } },
    { $unwind: "$combined" },
    { $replaceRoot: { newRoot: "$combined" } },
  ]);

  return new Response("Success", { data }, 200);
});

export const subHeadOptions = asyncErrorHandler(async (req) => {
  const { from, to } = req.query;

  const condition = { status: { $ne: 1 } };
  if (!isNull(from)) condition.date = { $gte: from };
  if (!isNull(to)) condition.date = { ...condition.date, $lte: to };

  let data = await models.IncomeExpense.aggregate([
    { $match: condition },
    { $group: { _id: "$subHead" } },
    {
      $lookup: {
        from: COLLECTIONS.ACCOUNT_SUB_HEAD,
        localField: "_id",
        foreignField: "_id",
        as: "data",
      },
    },
    { $unwind: "$data" },
    { $project: { label: "$data.name", value: "$_id" } },
  ]);

  return new Response("Success", { data }, 200);
});
