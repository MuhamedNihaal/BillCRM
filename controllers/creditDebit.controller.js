import { asyncErrorHandler, Error, Response } from "express-error-catcher";
import { isValidObjectId, startSession } from "mongoose";
import moment from "moment";

import models from "../models/index.js";
import Counter from "../helper/counter.js";

import { getDate, getTime, isValidNumber, paginationValues, userActivity } from "../helper/functions.js";

export const create = asyncErrorHandler(async (req) => {
  let { type, amount, remarks } = req.body;
  const { fundSource } = req.body;

  if (!req.isAdmin) throw new Error("You are not authorized to perform this action", 400);

  if (!fundSource) throw new Error("Fund Source is required", 400);
  if (type != 1 && type != 2) throw new Error("Type is required", 400);

  if (!isValidNumber(amount)) throw new Error("Amount is required", 400);

  type = Number(type);
  amount = Number(amount);

  const sourceDetails = await models.ChartOfAccount.findOne({
    _id: fundSource,
    status: { $ne: 1 },
  });

  if (!sourceDetails) throw new Error("Fund Source is not valid", 400);

  const prevBalance = sourceDetails.balance;

  if (type === 2) {
    if (prevBalance < amount) throw new Error("No enough balance in chart of account", 400);
  }

  const typeText = type === 2 ? "Debit" : "Credit";

  const counter = new Counter("creditDebit");
  const uniqueId = await counter.uniqueId("CD", moment().format("MMYY"));

  let data = {
    fundSource,
    type,
    amount,
    remarks,
    uniqueId: uniqueId,
    ip: req.ip,
    addedBy: req.user._id,
  };
  counter.save();
  data = await models.CreditDebit(data).save();


  userActivity(
    req,
    `New ${typeText}`,
    `New ${typeText} ID: ${uniqueId} has been added by ${req.user.username}`
  );

  return new Response(`${typeText} added successfully`, null, 200);
});

export const list = asyncErrorHandler(async (req) => {
  const condition = {};

  if (!req.isAdmin) throw new Error("You are not authorized to perform this action", 400);

  const { skip, limit } = paginationValues(req.query);

  const count = await models.CreditDebit.countDocuments(condition);
  const data = await models.CreditDebit.find(condition, "type amount remarks uniqueId status date time")
    .populate("fundSource", "name")
    .populate("addedBy", { name: CONCAT_NAME })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return new Response("Success", { count, data }, 200);
});

export const updateStatus = asyncErrorHandler(async (req) => {
  const { id, status } = req.body;
  if (!req.isAdmin) throw new Error("You are not authorized to perform this action", 400);
  if (!isValidObjectId(id)) throw new Error("No data found", 400);
  if (isNull(status) || isNaN(status)) throw new Error("Status required", 400);
  if (status != 0 && status != 1) throw new Error("Invalid status", 400);

  const data = await models.CreditDebit.findOne({ _id: id, status: 2 });
  if (!data) throw new Error("No data found", 400);

  let type = Number(data.type);
  let amount = Number(data.amount);

  const sourceDetails = await models.ChartOfAccount.findOne({
    _id: data.fundSource,
    status: { $ne: 1 },
  });

  if (!sourceDetails) throw new Error("Fund Source is not valid", 400);

  const prevBalance = sourceDetails.balance;
  const head = sourceDetails.head;
  const subHead = sourceDetails.subHead;

  let balance = 0;
  if (type === 2) {
    if (prevBalance < amount) throw new Error("No enough balance in chart of account ", 404);

    balance = prevBalance - amount;
  } else {
    balance = prevBalance + amount;
  }

  const typeText = type === 2 ? "Debit" : "Credit";

  if (status == 0) {
    await models.ChartOfAccount.updateOne(
      { _id: data.fundSource },
      { $inc: { balance: type === 2 ? -amount : amount } }
    );

    const TLCounter = new Counter("transactionLog");
    const TLUniqueId = await TLCounter.uniqueId("TL", moment().format("DDMMYY"));

    TLCounter.save();

    const transactionLog = {
      type,
      head,
      subHead,
      fundSource: data.fundSource,
      previousBalance: prevBalance,
      balance: balance,
      uniqueId: TLUniqueId,
      amount,
      remarks: data.remarks,
      creditDebit: data._id,

      ip: req.ip,
      addedBy: req.user._id,
    };

    await models.TransactionLog(transactionLog).save();
  }

  await models.CreditDebit.findByIdAndUpdate(data._id, {
    status,
    balance,
    upDate: getDate(),
    upTime: getTime(),
    updatedBy: req.user._id,
  })

  userActivity(
    req,
    `${typeText} Status update`,
    `${typeText} ID: ${data.uniqueId} status has been updated by ${req.user.username}`
  );

  return new Response(`Status updated successfully`, null, 200);
})