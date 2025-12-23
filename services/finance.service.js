import { INCOME_EXPENSE_TYPES, TRANSACTION_LOG_TYPES } from "../config.js";
import Counter from "../helper/counter.js";
import models from "../models/index.js";

export const handleApproveAmount = async ({ data, req }) => {
  const {
    _id: creditId,
    date,
    time,
    head,
    subHead,
    amount,
    remarks,
    fundSource,
    chartOfAccount,
    uniqueId,
    branchType,
    company,
    mainBranch,
    subBranch,
    franchise,
    collectionCenter,
  } = data;

  const isIncome = head === 1;

  const values = {
    amount: isIncome ? amount : -amount,

    incomeExpense: isIncome ? INCOME_EXPENSE_TYPES.INCOME : INCOME_EXPENSE_TYPES.EXPENSE,
    transactionLog: isIncome ? TRANSACTION_LOG_TYPES.CREDIT : TRANSACTION_LOG_TYPES.DEBIT,
  };

  const sourceData = await models.ChartOfAccount.findOne({ _id: fundSource, status: 0 });
  if (!sourceData) throw new Error("Fund source not found", 404);

  const accountData = await models.ChartOfAccount.findOne({ _id: chartOfAccount, status: 0 });
  if (!accountData) throw new Error("Chart of account not found", 404);

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
  await incomeExpenseCounter.save();

  await models
    .IncomeExpense({
      type: values.incomeExpense,
      subHead,

      chartOfAccount,
      fundSource,

      amount,
      total: amount,
      remarks: remarks,
      uniqueId: incomeExpenseUniqueId,

      credits: creditId,
      referenceNo: uniqueId,

      branchType: branchType,
      company,
      mainBranch,
      subBranch,
      franchise,
      collectionCenter,

      date,
      time,

      ip: req.ip,
      added: req.user?._id,
    })
    .save();

  await models
    .TransactionLog({
      type: TRANSACTION_LOG_TYPES.CREDIT,

      head: accountData.head,
      subHead: accountData.subHead,
      chartOfAccount,

      previousBalance: accountData.balance,
      balance: accountData.balance + amount,

      amount,
      remarks,
      uniqueId: uniqueIdOne,

      credits: creditId,
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
    })
    .save();

  await models
    .TransactionLog({
      type: values.transactionLog,

      head: sourceData.head,
      subHead: sourceData.subHead,
      chartOfAccount: fundSource,

      previousBalance: sourceData.balance,
      balance: sourceData.balance + isIncome ? amount : -amount,

      amount,
      remarks,
      uniqueId: uniqueIdTwo,

      credits: creditId,
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
    })
    .save();
};
