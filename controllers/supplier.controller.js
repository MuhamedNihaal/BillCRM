import moment from "moment";
import models from "../models/index.js";
import { asyncErrorHandler, Error, Response } from "express-error-catcher";
import {
  getDate,
  getTime,
  paginationValues,
  querySearchSanitize,
} from "../helper/functions.js";
import userActivity, { ACTIVITY_ACTIONS } from "@/utils/userActivity.js";
import Counter from "../helper/counter.js";
import COLLECTIONS from "@/config/collections.js";
// import { ACCOUNT_HEAD, ACCOUNT_SUBHEAD, COLLECTIONS } from "../config.js";
import { supplierSchema } from "../validation/validation.yup.js";

export const createSupplier = asyncErrorHandler(async (req) => {
  const existingMobileSupplier = await models.Supplier.findOne({
    mobile: req.body.mobile,
  }).lean();
  const existingMobiles = existingMobileSupplier ? [req.body.mobile] : [];

  const existingEmailSupplier = await models.Supplier.findOne({
    email: req.body.email,
  }).lean();
  const existingEmails = existingEmailSupplier ? [req.body.email] : [];

  const validation = await supplierSchema(
    req.body,
    existingMobiles,
    existingEmails,
  );
  if (validation.error) {
    throw new Error(validation.error, 400);
  }

  let {
    name,
    company,
    email,
    mobile,
    address,
    gstIn,
    accountNo,
    bank,
    branch,
    state,
  } = req.body;

  const counter = new Counter({ counterId: COLLECTIONS.SUPPLIER });
  const uniqueId = await counter.uniqueId({
    prefix: "SP",
    identifier: moment().format("MMYY"),
  });

  let data = await models
    .Supplier({
      name,
      company,
      uniqueId,
      email,
      mobile,
      address,
      gstIn,
      accountNo,
      bank,
      branch,
      state,
      addedBy: req.user._id,
    })
    .save();

  if (!data) throw new Error("Failed to create", 400);

  //   const chartOfAccount = await models.ChartOfAccount.create({
  //     head: ACCOUNT_HEAD.EXPENSE,
  //     subHead: ACCOUNT_SUBHEAD.SUPPLIER_ACCOUNT,
  //     name: `${name} - Office Account`,
  //     uniqueId,
  //     balance: 0,
  //     status: 0,
  //     addedBy: req.user._id,
  //   });

  userActivity({
    req,
    action: ACTIVITY_ACTIONS.INVENTORY.SUPPLIER_CREATED,
    description: `Supplier "${name} - ${uniqueId}" created by {userName}`,
  });
  return new Response("Supplier created successfully", null, 200);
});

export const updateSupplier = asyncErrorHandler(async (req) => {
  let {
    id,
    name,
    company,
    email,
    mobile,
    address,
    gstIn,
    accountNo,
    bank,
    branch,
    state,
  } = req.body;
  if (isNull(id)) throw new Error("Product not found", 400);
  if (isNull(name)) throw new Error("Supplier name required", 400);
  if (isNull(company)) throw new Error("Company name required", 400);
  if (isNull(mobile)) throw new Error("Mobile required", 400);
  if (isNull(state)) throw new Error("State required", 400);
  if (isNull(gstIn)) throw new Error("GSTIN required", 400);

  let data = {
    name,
    company,
    email: email || "",
    mobile,
    address: address || "",
    gstIn,
    accountNo: accountNo || "",
    bank: bank || "",
    branch: branch || "",
    state,
    updatedBy: req.user._id,
    upTime: getTime(),
    upDate: getDate(),
  };
  // console.log("Data to update : ", data);

  let updated = await models.Supplier.findOneAndUpdate(
    { _id: id, status: { $ne: 1 } },
    data,
  );
  if (!updated) throw new Error("Failed to update", 400);
  userActivity({
    req,
    action: ACTIVITY_ACTIONS.INVENTORY.SUPPLIER_UPDATED,
    description: `Supplier "${name} - ${updated?.uniqueId}" updated by {userName}`,
  });
  return new Response("Supplier updated successfully", null, 200);
});

export const getSuppliers = asyncErrorHandler(async (req) => {
  let { skip, limit } = paginationValues(req.query);
  let { search } = req.query;
  let condition = { status: { $ne: 1 } };

  if (!isNull(search)) {
    search = querySearchSanitize(search);
    condition.$or = [
      { name: { $regex: search, $options: "i" } },
      { uniqueId: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
      { mobile: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
    ];
  }

  let count = await models.Supplier.countDocuments(condition);
  let data = await models.Supplier.find(
    condition,
    "name company email mobile address gstIn accountNo bank branch status date uniqueId",
  )
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit)
    .populate("state", "name")
    .populate("addedBy", { name: CONCAT_NAME });

  return new Response(null, { count, data }, 200);
});

export const getSupplierDetails = asyncErrorHandler(async (req) => {
  let { id } = req.query;
  if (isNull(id)) throw new Error("Supplier not found", 400);
  let condition = { _id: id, status: { $ne: 1 } };

  let data = await models.Supplier.findOne(
    condition,
    "name company email mobile address gstIn accountNo bank branch status date uniqueId",
  ).populate("state", OPTIONS_FIELD);

  return new Response(null, { data }, 200);
});

export const deleteSupplier = asyncErrorHandler(async (req) => {
  let { id } = req.query;
  if (isNull(id)) throw new Error("Supplier not found", 400);

  let data = {
    status: 1,
    updatedBy: req.user._id,
    upTime: getTime(),
    upDate: getDate(),
  };

  let updated = await models.Supplier.findOneAndUpdate(
    { _id: id, status: { $ne: 1 } },
    data,
  );
  if (!updated) throw new Error("Failed to delete", 400);
  userActivity({
    req,
    action: ACTIVITY_ACTIONS.INVENTORY.SUPPLIER_DELETED,
    description: `Supplier "${updated?.name} - ${updated?.uniqueId}" deleted by {userName}`,
  });
  return new Response("Supplier deleted successfully", null, 200);
});

export const statusChange = asyncErrorHandler(async (req) => {
  let { id, status } = req.body;
  if (isNull(id)) throw new Error("Supplier not found", 400);
  if (isNull(status)) throw new Error("Status not found", 400);
  if (status != 0 && status != 2) throw new Error("Invalid status", 400);

  let data = {
    status,
    updatedBy: req.user._id,
    upDate: getDate(),
    upTime: getTime(),
  };

  let updated = await models.Supplier.findOneAndUpdate(
    { _id: id, status: { $ne: 1 } },
    data,
  );
  userActivity({
    req,
    action: ACTIVITY_ACTIONS.INVENTORY.SUPPLIER_STATUS,
    description: `Supplier "${updated?.name}" status changed by {userName}`,
  });
  return new Response("Supplier status changed successfully", null, 200);
});
