import { asyncErrorHandler, Error, Response } from "express-error-catcher";
import {
  getTime,
  paginationValues,
  getDate,
  userActivity,
  isObjectIdsEqual,
} from "../helper/functions.js";

import {
  ACCOUNT_HEAD,
  COLLECTIONS,
  INCOME_EXPENSE_TYPES,
  TRANSACTION_LOG_TYPES,
} from "../config.js";
import models from "../models/index.js";
import Counter from "../helper/counter.js";

export const create = asyncErrorHandler(async (req) => {
  const { subHead, chartOfAccount, remarks, attachment, dueDate } = req.body;

  let { head, branchType, paymentType, amount, fundSource, date, time, mainBranch, subBranch, franchise, collectionCenter, company = null } = req.body;
  let received = 0;

  if (isNull(branchType) || isNaN(branchType)) throw new Error("Branch Type is required", 400);
  if (isNull(head)) throw new Error("Head is required", 400);
  if (isNull(subHead)) throw new Error("Sub Head is required", 400);
  if (isNull(paymentType)) throw new Error("Payment Type is required", 400);
  if (isNull(chartOfAccount)) throw new Error("Chart Of Account is required", 400);
  if (branchType == 1 && isNull(mainBranch)) throw new Error("Main Branch is required", 400);
  if (branchType == 2 && isNull(subBranch)) throw new Error("Sub Branch is required", 400);
  if (branchType == 3 && isNull(franchise)) throw new Error("Franchise is required", 400);
  if (branchType == 4 && isNull(collectionCenter)) throw new Error("Collection Center is required", 400);

  if (!isNull(time)) time = moment(time, "HH:mm").format("HH:mm:ss");

  head = Number(head);
  paymentType = Number(paymentType);
  amount = Number(amount);

  if (isNull(amount) || amount <= 0) throw new Error("Amount is required", 400);

  const chartCondition = {
    status: 0,
    _id: chartOfAccount,
    head: head === 1 ? ACCOUNT_HEAD.INCOME : ACCOUNT_HEAD.EXPENSE,
  };

  const accountData = await models.ChartOfAccount.findOne(chartCondition);
  if (!accountData) throw new Error("Chart Of Account not found", 400);

  if (paymentType === 2) {
    if (isNull(fundSource)) throw new Error("Fund Source is required", 400);
    else {
      const condition = { status: 0, _id: fundSource };
      const data = await models.ChartOfAccount.findOne(condition);
      if (!data) throw new Error("Fund Source not found", 400);
    }
    received = amount;
  } else {
    fundSource = null;
    if (isNull(dueDate)) throw new Error("Due Date is required", 400);
  }

  if (branchType == 1 || branchType == 2 || branchType == 3) {
    let data = await models.Branch.findOne({ _id: { $in: [mainBranch, subBranch, franchise] } })
    if (data?.type != 1) mainBranch = data?.mainBranch;
    company = data?.company
  } else if (branchType == 4) {
    let data = await models.CollectionCenter.findById(collectionCenter)
    company = data?.company
    mainBranch = data?.mainBranch
    subBranch = data?.subBranch
  }

  const data = {
    head,
    paymentType,
    branchType,
    subHead,
    chartOfAccount,
    fundSource,
    amount,
    received,
    remarks,
    attachment,
    dueDate,

    company,
    mainBranch,
    subBranch,
    franchise,
    collectionCenter,

    date,
    time,

    ip: req.ip,
    addedBy: req.user._id,
  };

  await models.Credits(data).save();

  const typeText = `${paymentType === 1 ? "Credit" : "Cash"} ${head === 1 ? "Income" : "Expense"}`;
  userActivity(
    req,
    `New ${typeText} Added`,
    `New ${typeText} has been added for amount: ${amount} by ${req.user.username}`
  );

  return new Response(`${typeText} added successfully`, null, 200);
});

export const list = asyncErrorHandler(async (req) => {
  const { from, to, head, subHead, paymentType, status, branchType, mainBranch, subBranch, franchise, collectionCenter } = req.query;

  const { skip, limit } = paginationValues(req.query);

  const condition = {
    status: { $ne: 1 },
  };

  if (!isNull(from)) condition.date = { $gte: from };
  if (!isNull(to)) condition.date = { ...condition.date, $lte: to };

  if (!isNull(head)) condition.head = Number(head);
  if (!isNull(subHead)) condition.subHead = ObjectId(subHead);

  if (!isNull(status)) condition.status = Number(status);
  if (!isNull(paymentType)) condition.paymentType = Number(paymentType);

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

  const count = await models.Credits.countDocuments(condition);

  const data = await models.Credits.find(condition, {
    date: 1,
    head: 1,
    amount: 1,
    status: 1,
    attachment: 1,
    paymentType: 1,
    branchType: 1,
    isTotalPaid: { $cond: { if: { $eq: ["$amount", "$received"] }, then: true, else: false } },
    isCreditPayment: { $cond: { if: { $eq: ["$paymentType", 1] }, then: true, else: false } },
  })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate("subHead", "name")
    .populate("chartOfAccount", "name")
    .populate("mainBranch", "name")
    .populate("subBranch", "name")
    .populate("franchise", "name")
    .populate("collectionCenter", "name")
    .populate("addedBy", { name: CONCAT_NAME })
    .lean();

  return new Response("success", { count, data }, 200);
});

export const statusChange = asyncErrorHandler(async (req) => {
  let { id, status } = req.body;
  status = Number(status);

  const statusOptions = { 0: "Approved", 2: "Canceled" };
  const statusText = statusOptions[status] || "";
  if (isNull(statusText)) throw new Error("Invalid status", 400);

  const data = await models.Credits.findOne({ status: 3, _id: id, paymentType: 2 });
  if (isNull(data)) throw new Error("Data not found", 400);

  const isApprove = status === 0;

  const date = getDate();
  const time = getTime();
  if (isApprove) await handleApproveAmount({ data, req });

  await models.Credits.updateOne(
    { _id: id },
    {
      $set: {
        status,
        upTime: time,
        upDate: date,
        updatedBy: req.user._id,

        statusUpdate: { date, time, staff: req.user._id },
      },
    }
  );

  await userActivity(
    req,
    `Credit Income Expense ${statusText}`,
    `Credit Income Expense ${statusText} by ${req.user.username}`
  );
  return new Response(`${statusText} successfully`, null, 200);
});

export const getEditPaymentDetails = asyncErrorHandler(async (req) => {
  const id = req.query.id;
  if (isNull(id)) throw new Error("Id Not found", 400);

  const filterObject = { _id: ObjectId(id), status: { $in: [3, 0] } };
  const selectFields = { name: 1, label: "$name", value: "$_id" };

  const isNotCash = { $ne: ["$paymentType", 2] };
  const isCreditNotEmpty = { $ne: [{ $size: "$creditPayments" }, 0] };

  const data = await models.Credits.findOne(filterObject, {
    head: 1,
    date: 1,
    time: 1,
    amount: 1,
    status: 1,
    remarks: 1,
    dueDate: 1,
    attachment: 1,
    paymentType: 1,
    branchType: 1,
    subHeadId: "$subHead",
    paidAmount: "$paidAmount",
    fundSourceId: "$fundSource",
    chartOfAccountId: "$chartOfAccount",
    isDisabled: {
      $cond: { if: { $and: [isNotCash, isCreditNotEmpty] }, then: true, else: false },
    },
  })
    .populate("subHead", selectFields)
    .populate("chartOfAccount", selectFields)
    .populate("fundSource", selectFields)
    .populate("mainBranch", selectFields)
    .populate("subBranch", selectFields)
    .populate("franchise", selectFields)
    .populate("collectionCenter", selectFields);

  return new Response("Success", { data }, 200);
});

export const updatePayments = asyncErrorHandler(async (req) => {
  const { id, subHead, chartOfAccount, remarks, attachment, dueDate } = req.body;
  let { head, paymentType, amount, fundSource, branchType, date, time, mainBranch, subBranch, franchise, collectionCenter, company = null } = req.body;
  let received = 0;

  if (isNull(id)) throw new Error("Id not found", 400);
  if (isNull(head)) throw new Error("Head is required", 400);
  if (isNull(subHead)) throw new Error("Sub Head is required", 400);
  if (isNull(paymentType)) throw new Error("Payment Type is required", 400);
  if (isNull(chartOfAccount)) throw new Error("Chart Of Account is required", 400);

  head = Number(head);
  paymentType = Number(paymentType);
  amount = Number(amount);

  if (isNull(amount) || amount <= 0) throw new Error("Amount is required", 400);

  const prevData = await models.Credits.findOne({ _id: id, status: 3 });
  if (isNull(prevData)) throw new Error("Update not permitted", 400);

  const prevAmount = prevData.amount;
  const isCash = prevData.paymentType === 2;
  const isCreditEmpty = prevData.creditPayments?.length === 0;

  if (branchType == 1 || branchType == 2 || branchType == 3) {
    let data = await models.Branch.findOne({ _id: { $in: [mainBranch, subBranch, franchise] } })
    if (data?.type != 1) mainBranch = data?.mainBranch;
    company = data?.company
  } else if (branchType == 4) {
    let data = await models.CollectionCenter.findById(collectionCenter)
    company = data?.company
    mainBranch = data?.mainBranch
    subBranch = data?.subBranch
  }

  let update = {
    amount,
    received,
    remarks,
    dueDate,
    attachment,
    time,
    date,
    updatedBy: req.user._id,
    upDate: getDate(),
    upTime: getTime(),
  };

  const isChangeable = isCash || (!isCash && isCreditEmpty);
  if (isChangeable) {
    const condition = { status: 0, _id: chartOfAccount };
    const data = await models.ChartOfAccount.findOne(condition);
    if (!data) throw new Error("Chart Of Account not found", 400);

    update = {
      ...update,
      head,
      subHead,
      paymentType,
      chartOfAccount,
      fundSource,
      branchType,
      company,
      mainBranch,
      subBranch,
      franchise,
      collectionCenter,
    }

    if (paymentType === 2) {
      if (isNull(fundSource)) throw new Error("Fund Source is required", 400);
      else {
        const condition = { status: 0, _id: fundSource };
        const data = await models.ChartOfAccount.findOne(condition);
        if (!data) throw new Error("Fund Source not found", 400);
      }
      update.received = amount;
    } else {
      update.fundSource = null;
      if (isNull(dueDate)) throw new Error("Due Date is required", 400);
    }
  } else {
    if (prevAmount < amount) throw new Error("Amount Must Greater than previous");
  }
console.log(id)
console.log(update)
  await models.Credits.updateOne({ _id: id, status: 3 }, { $set: update });

  return new Response("Payment updated successfully", null, 200);
});

export const subHeadOptions = asyncErrorHandler(async (req) => {
  let head = Number(req.query.head);

  if (head === 1) head = ACCOUNT_HEAD.INCOME;
  else if (head === 2) head = ACCOUNT_HEAD.EXPENSE;
  else throw new Error("Invalid head", 400);

  const filterObject = { status: 0, head: head };
  const data = await models.AccountSubHead.find(filterObject, OPTIONS_FIELD)
    .sort({ createdAt: -1 })
    .limit(150);

  return new Response("Success", { data }, 200);
});

export const fundSourceOptions = asyncErrorHandler(async (req) => {
  const branch = req.branch || req.query.branch || null;
  const collectionCenter = req.collectionCenter || req.query.collectionCenter || null;

  if (!req.isAdmin) {
    if (isNull(branch) && isNull(collectionCenter)) throw new Error("Branch or Collection Center required", 400);
  }

  let condition = {
    status: 0,
    head: ACCOUNT_HEAD.BANK
  };
  if (!isNull(branch)) condition.branch = branch;
  if (!isNull(collectionCenter)) condition.collectionCenter = collectionCenter;

  const data = await models.ChartOfAccount.find(condition, OPTIONS_FIELD)
    .sort({ createdAt: -1 })
    .limit(150);
  return new Response("Success", { data }, 200);
});

export const filterSubHeadOptions = asyncErrorHandler(async (req) => {
  const { from, to, head, paymentType, status } = req.query;
  const condition = {
    status: { $ne: 1 },
  };

  if (!isNull(from)) condition.date = { $gte: from };
  if (!isNull(to)) condition.date = { ...condition.date, $lte: to };

  if (!isNull(head)) condition.head = Number(head);

  if (!isNull(status)) condition.status = Number(status);
  if (!isNull(paymentType)) condition.paymentType = Number(paymentType);

  const data = await models.Credits.aggregate([
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

export const createIncomeExpense = asyncErrorHandler(async (req) => {
  const counter = new Counter("income/expense");
  const incomeExpenseUniqueId = await incomeExpenseCounter.uniqueId("IE", moment().format("YYMM"));
  incomeExpenseCounter.save();
  await models
    .IncomeExpense({
      type: 1,
      subType: ACCOUNT_SUB_TYPE.FEE,
      chartOfAccount: CHART_OF_ACCOUNT.COURSE_FEE,
      fundSource: CHART_OF_ACCOUNT.RAZORPAY,
      amount,
      gst: 0,
      total: amount,
      branch: lead.branch,
      comment: transactionComment,
      uniqueId: incomeExpenseUniqueId,

      lead: lead._id,
      course: lead.course?._id,
      profile: lead.reg_id?._id,
      batch: lead.courseAssignedId?.batch,
    })
    .save({ session });
});

export const details = asyncErrorHandler(async (req) => {
  const { id } = req.query;

  if (isNull(id)) throw new Error("Id Not found", 400);

  const condition = { _id: ObjectId(id) };

  let data = await models.Credits.aggregate([
    { $match: condition },
    {
      $lookup: {
        from: COLLECTIONS.ACCOUNT_SUB_HEAD,
        localField: "subHead",
        foreignField: "_id",
        as: "subHeadData",
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
      $lookup: {
        from: COLLECTIONS.CHART_OF_ACCOUNT,
        localField: "fundSource",
        foreignField: "_id",
        as: "fundSourceData",
      },
    },
    {
      $lookup: {
        from: COLLECTIONS.USERS,
        localField: "addedBy",
        foreignField: "_id",
        as: "userData",
      },
    },
    {
      $lookup: {
        from: COLLECTIONS.USERS,
        localField: "statusUpdate.staff",
        foreignField: "_id",
        as: "approvedData",
      },
    },
    {
      $lookup: {
        from: COLLECTIONS.BRANCH,
        localField: "mainBranch",
        foreignField: "_id",
        as: "mainBranchData",
      },
    },
    {
      $lookup: {
        from: COLLECTIONS.BRANCH,
        localField: "subBranch",
        foreignField: "_id",
        as: "subBranchData",
      },
    },
    {
      $lookup: {
        from: COLLECTIONS.BRANCH,
        localField: "franchise",
        foreignField: "_id",
        as: "franchiseData",
      },
    },
    {
      $lookup: {
        from: COLLECTIONS.BRANCH,
        localField: "collectionCenter",
        foreignField: "_id",
        as: "collectionCenterData",
      },
    },
    { $unwind: { path: "$creditPayments", preserveNullAndEmptyArrays: true } },
    {
      $lookup: {
        from: COLLECTIONS.USERS,
        localField: "creditPayments.addedBy",
        foreignField: "_id",
        as: "paymentUser",
      },
    },
    {
      $lookup: {
        from: COLLECTIONS.CHART_OF_ACCOUNT,
        localField: "creditPayments.fundSource",
        foreignField: "_id",
        as: "creditFundSourceData",
      },
    },
    { $sort: { "creditPayments._id": -1 } },
    {
      $group: {
        _id: "$_id",
        date: { $first: "$date" },
        time: { $first: "$time" },
        addedDate: { $first: "$addedDate" },
        addedTime: { $first: "$addedTime" },
        head: { $first: "$head" },
        status: { $first: "$status" },
        amount: { $first: "$amount" },
        remarks: { $first: "$remarks" },
        received: { $first: "$received" },
        attachment: { $first: "$attachment" },
        paymentType: { $first: "$paymentType" },
        approvedDate: { $first: "$statusUpdate.date" },
        approvedTime: { $first: "$statusUpdate.time" },
        branchType: { $first: "$branchType" },
        subHead: { $first: { $arrayElemAt: ["$subHeadData.name", 0] } },
        staffFirstName: { $first: { $arrayElemAt: ["$userData.firstName", 0] } },
        staffLastName: { $first: { $arrayElemAt: ["$userData.lastName", 0] } },
        approvedFirstName: { $first: { $arrayElemAt: ["$approvedData.firstName", 0] } },
        approvedLastName: { $first: { $arrayElemAt: ["$approvedData.lastName", 0] } },
        chartOfAccount: { $first: { $arrayElemAt: ["$chartOfAccountData.name", 0] } },
        fundSource: { $first: { $arrayElemAt: ["$fundSourceData.name", 0] } },
        creditPayments: {
          $push: {
            $cond: {
              if: { $eq: [{ $ifNull: ["$creditPayments._id", null] }, null] },
              then: "$$REMOVE",
              else: {
                date: "$creditPayments.date",
                time: "$creditPayments.time",
                due: "$creditPayments.due",
                amount: "$creditPayments.amount",
                remarks: "$creditPayments.remarks",
                attachment: "$creditPayments.attachment",
                fundSource: { $arrayElemAt: ["$creditFundSourceData.name", 0] },
                addedBy: { $arrayElemAt: ["$paymentUser.firstName", 0] },
                staffLastName: { $arrayElemAt: ["$paymentUser.lastName", 0] },
                staffFirstName: { $arrayElemAt: ["$paymentUser.firstName", 0] },
              },
            },
          },
        },
        mainBranch: { $first: { $arrayElemAt: ["$mainBranchData.name", 0] } },
        subBranch: { $first: { $arrayElemAt: ["$subBranchData.name", 0] } },
        franchise: { $first: { $arrayElemAt: ["$franchiseData.name", 0] } },
        collectionCenter: { $first: { $arrayElemAt: ["$collectionCenterData.name", 0] } },
      },
    },
  ]);

  data = data[0];
  if (isNull(data)) throw new Error("No Data Found", 400);
  return new Response("Success", { data }, 200);
});

export const addCreditPayment = asyncErrorHandler(async (req) => {
  const { id, fundSource, remarks, attachment } = req.body;
  let { date, time } = req.body;
  let { amount } = req.body;

  if (isNull(id)) throw new Error("Id Required", 400);
  if (isNull(date)) throw new Error("Date required", 400);
  if (isNull(amount) || isNaN(amount) || amount < 1) throw new Error("Amount Required", 400);
  if (isNull(fundSource)) throw new Error("Fund Source Required", 400);

  amount = Number(amount);

  const condition = { _id: id, status: 3, paymentType: 1 };
  const alreadyData = await models.Credits.findOne(condition);

  if (isNull(alreadyData)) throw new Error("Data Not Found", 400);

  const totalAmount = alreadyData.amount || 0;
  const totalReceived = alreadyData.received || 0;
  const prevPending = totalAmount - totalReceived;

  if (prevPending < amount) throw new Error("Amount is greater than due amount", 400);
  const currentDate = getDate();
  const currentTime = getTime();

  if (isNull(date)) date = currentDate;
  if (!isNull(time)) time = moment(time, "HH:mm").format("HH:mm:ss");
  else time = currentTime;

  const due = prevPending - amount;

  const updateData = {
    date,
    time,
    fundSource,
    amount,
    remarks,
    attachment,
    due,
    total: totalAmount,
    addedBy: req.user._id,
  };

  const data = {
    date,
    time,
    head: alreadyData.head,
    subHead: alreadyData.subHead,
    amount,
    remarks,
    fundSource,
    chartOfAccount: alreadyData.chartOfAccount,
    branchType: alreadyData?.branchType,
    company: alreadyData?.company,
    mainBranch: alreadyData?.mainBranch,
    subBranch: alreadyData?.subBranch,
    franchise: alreadyData?.franchise,
    collectionCenter: alreadyData?.collectionCenter,
  };

  await handleApproveAmount({ data, req });

  const updateOperations = {
    $push: { creditPayments: updateData },
    $inc: { received: amount },
  };
  if (due === 0)
    updateOperations["$set"] = {
      status: 0,
      statusUpdate: { date: currentDate, time: currentTime, staff: req.user._id },
    };

  await models.Credits.updateOne(condition, updateOperations);

  return new Response("Payment Added", null, 201);
});

export const listCreditPayments = asyncErrorHandler(async (req) => {
  const { from, to, head, subHead, status } = req.query;

  const { skip, limit } = paginationValues(req.query);
  const condition = { paymentType: 1 };

  if (!isNull(from)) condition.date = { $gte: from };
  if (!isNull(to)) condition.date = { ...condition.date, $lte: to };

  if (!isNull(head)) condition.head = Number(head);
  if (!isNull(status)) condition.status = Number(status);
  if (!isNull(subHead)) condition.subHead = subHead;

  const count = await models.Credits.countDocuments(condition);
  const data = await models.Credits.find(condition, {
    date: 1,
    head: 1,
    amount: 1,
    status: 1,
    received: 1,
  })
    .populate("subHead", "name")
    .populate("chartOfAccount", "name")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  return new Response("Success", { count, data }, 200);
});

const handleApproveAmount = async ({ data, req }) => {
  const { date, time, head, subHead, amount, remarks, fundSource, chartOfAccount, uniqueId, company, mainBranch, subBranch, franchise, collectionCenter, branchType } = data;
  const { _id: credits } = data;

  const isIncome = head === 1;

  const values = {
    amount: isIncome ? amount : -amount,
    incomeExpense: isIncome ? INCOME_EXPENSE_TYPES.INCOME : INCOME_EXPENSE_TYPES.EXPENSE,
    transactionLog: isIncome ? TRANSACTION_LOG_TYPES.CREDIT : TRANSACTION_LOG_TYPES.DEBIT,
  };

  const sourceData = await models.ChartOfAccount.findOne({ _id: fundSource, status: 0 });
  if (!sourceData) throw new Error("Fund source not found", 400);

  const accountData = await models.ChartOfAccount.findOne({ _id: chartOfAccount, status: 0 });
  if (!accountData) throw new Error("Chart Of Account not found", 400);

  await models.ChartOfAccount.updateOne({ _id: chartOfAccount }, { $inc: { balance: amount } });
  await models.ChartOfAccount.updateOne({ _id: fundSource }, { $inc: { balance: values.amount } });

  const identifier = moment().format("DDMMYY");

  const counter = new Counter("transactionLog");
  const incomeExpenseCounter = new Counter("income/expense");

  const uniqueIdOne = await counter.uniqueId("TR", identifier);
  await counter.save();

  const uniqueIdTwo = await counter.uniqueId("TR", identifier);
  await counter.save();

  const incomeExpenseUniqueId = await incomeExpenseCounter.uniqueId("IE", identifier);
  incomeExpenseCounter.save();

  await models.IncomeExpense({
    type: values.incomeExpense,
    subHead,

    chartOfAccount,
    fundSource,

    amount,
    total: amount,
    remarks,
    uniqueId: incomeExpenseUniqueId,

    credits,
    referenceNo: uniqueId,

    branchType,
    company,
    mainBranch,
    subBranch,
    franchise,
    collectionCenter,

    date,
    time,

    ip: req.ip,
    addedBy: req.user._id,
  }).save();

  await models.TransactionLog({
    type: TRANSACTION_LOG_TYPES.CREDIT,

    head: accountData.head,
    subHead: accountData.subHead,
    chartOfAccount,

    previousBalance: accountData.balance,
    balance: accountData.balance + amount,

    amount,
    remarks,
    uniqueId: uniqueIdOne,

    credits,
    referenceNo: uniqueId,

    branchType,
    company,
    mainBranch,
    subBranch,
    franchise,
    collectionCenter,

    date,
    time,

    ip: req.ip,
    addedBy: req.user._id,
  }).save();

  await models.TransactionLog({
    type: values.transactionLog,

    head: sourceData.head,
    subHead: sourceData.subHead,
    chartOfAccount: fundSource,

    previousBalance: sourceData.balance,
    balance: sourceData.balance + isIncome ? amount : -amount,

    amount,
    remarks,
    uniqueId: uniqueIdTwo,

    credits,
    referenceNo: uniqueId,

    branchType,
    company,
    mainBranch,
    subBranch,
    franchise,
    collectionCenter,

    date,
    time,

    ip: req.ip,
    addedBy: req.user._id,
  }).save();
};

const generateRemarks = ({ incomeExpense, prev, current, prevData, data }) => {
  let remarks = `Payment #${incomeExpense?.uniqueId}:`;

  const changes = [];

  if (prevData.chartOfAccount != data.chartOfAccount)
    changes.push(`chart of account updated from '${prev?.name || ""}' to '${current?.name || ""}'`);
  if (prevData.fundSource != data.fundSource)
    changes.push(`fund source updated from '${prev?.name || ""}' to '${current?.name || ""}'`);
  if (data.amount != prevData.amount)
    changes.push(`amount changed from ${prevData?.amount || 0} to ${data.amount || 0}`);
  if (data.type != prevData.type)
    changes.push(
      `head changed from ${prevData?.head == 1 ? "Income" : "Expense"} to ${data.head == 1 ? "Income" : "Expense"}`
    );

  if (changes.length > 0) remarks += ` ${changes.join(", ")}.`;
  else return "";

  return remarks;
};
