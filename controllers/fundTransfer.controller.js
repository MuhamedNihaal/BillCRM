import { asyncErrorHandler, Error, Response } from "express-error-catcher";

import { getDate, getTime, paginationValues, userActivity } from "../helper/functions.js";
import Counter from "../helper/counter.js";
import models from "../models/index.js";
import { TRANSACTION_LOG_TYPES } from "../config.js";

const STATUS = { APPROVED: 0, REJECTED: 1, PENDING: 2 };

export const create = asyncErrorHandler(async (req) => {
  const { from, to, remarks } = req.body;
  let { date, time, amount } = req.body;

  amount = parseFloat(amount);


  if (isNull(date)) throw new Error("Date is required", 400);
  if (isNull(time)) throw new Error("Time is required", 400);
  if (isNull(from)) throw new Error("'From fund source' is required", 400);
  if (isNull(to)) throw new Error("'To fund source' is required", 400);
  if (isNull(amount)) throw new Error("Amount is required", 400);
  if (from == to) throw new Error("'From' and 'To' fundsources are same", 400);

  if (isNaN(amount) || amount < 1) throw new Error("Amount is not valid", 400);

  if (!isNull(time)) time = moment(time, "HH:mm").format("HH:mm:ss");

  const fromData = await models.ChartOfAccount.findOne({ _id: from, status: 0 });
  if (!fromData) throw new Error("'From fund source' not found", 400);

  const toData = await models.ChartOfAccount.findOne({ _id: to, status: 0 });
  if (!toData) throw new Error("'To fund source' not found", 400);

  const counter = new Counter("fundTransfer");
  const uniqueId = await counter.uniqueId("FT", "");

  await models
    .FundTransfer({
      from,
      to,
      amount,
      remarks,
      ip: req.ip,
      uniqueId,
      addedBy: req.user._id,
      date,
      time,
    })
    .save();

  userActivity(
    req,
    `Fund transfer added`,
    `Fund transfer '${uniqueId}' has been added by '${req.user.username}'`
  );

  return new Response("Fund Transfer added Successfully", null, 200);
});

export const list = asyncErrorHandler(async (req) => {
  const condition = {};
  if (!req.isAdmin) condition.addedBy = req.user._id;

  const { skip, limit } = paginationValues(req.query);
  const count = await models.FundTransfer.countDocuments(condition);
  const data = await models.FundTransfer.find(condition, "amount remarks uniqueId status date")
    .populate("from", "name")
    .populate("to", "name")
    .populate("addedBy", { name: CONCAT_NAME })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .lean();

  return new Response("Success", { count, data }, 200);
});

export const statusChange = asyncErrorHandler(async (req) => {
  let { id, status } = req.body;
  if (!req.isAdmin) throw new Error("You don't have the permission to change status", 400);

  status = Number(status);

  if (isNull(id)) throw new Error("Something went wrong", 400);
  if (isNull(status)) throw new Error("Status is required", 400);
  if (isNaN(status) || status != STATUS.APPROVED && status != STATUS.REJECTED) throw new Error("Invalid Status", 400);

  const data = await models.FundTransfer.findOne({ _id: id, status: STATUS.PENDING });
  if (!data) throw new Error("No data found", 400);

  let statusText = "Rejected";

  const update = {
    status,
    statusUpdate: { staff: req.user?._id, date: getDate(), time: getTime() },
  };

  if (status === STATUS.APPROVED) {
    const { amount, from, to, remarks, date, time } = data;
    statusText = "Approved";

    const fromData = await models.ChartOfAccount.findOneAndUpdate(
      { _id: from, status: 0 },
      { $inc: { balance: -amount } },
      { new: true }
    );
    if (!fromData) throw new Error("'From' fund source not found", 400);

    const toData = await models.ChartOfAccount.findOneAndUpdate(
      { _id: to, status: 0 },
      { $inc: { balance: amount } },
      { new: true }
    );

    if (!toData) throw new Error("'To' fund source not found", 400);

    const identifier = moment().format("DDMMYY");
    const counter = new Counter("transactionLog");

    const uniqueIdOne = await counter.uniqueId("TR", identifier);
    await counter.save();

    const uniqueIdTwo = await counter.uniqueId("TR", identifier);
    await counter.save();

    await models
      .TransactionLog({
        type: TRANSACTION_LOG_TYPES.DEBIT,

        head: fromData.head,
        subHead: fromData.subHead,
        chartOfAccount: from,

        previousBalance: fromData.balance + amount,
        balance: fromData.balance,

        amount,
        remarks,
        uniqueId: uniqueIdOne,
        referenceNo: data.uniqueId,
        fundTransfer: data._id,
        addedBy: req.user._id,
        ip: req.ip,
        date,
        time,
      })
      .save();

    await models
      .TransactionLog({
        type: TRANSACTION_LOG_TYPES.CREDIT,

        head: toData.head,
        subHead: toData.subHead,
        chartOfAccount: to,

        previousBalance: toData.balance - amount,
        balance: toData.balance,

        amount,
        remarks,
        uniqueId: uniqueIdTwo,
        referenceNo: data.uniqueId,
        fundTransfer: data._id,
        addedBy: req.user._id,
        ip: req.ip,
        date,
        time,
      })
      .save();
  }

  await models.FundTransfer.updateOne({ _id: id }, { $set: update });
  userActivity(
    req,
    `Fund transfer '{statusText}''`,
    `Fund transfer '${data.uniqueId}' has been ${statusText} by '${req.user?.username}'`
  );

  return new Response(`Fund transfer ${statusText} successfully`, null, 200);
});
