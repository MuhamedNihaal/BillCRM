import moment from "moment";
import models from "../models/index.js";
import { asyncErrorHandler, Error, Response } from "express-error-catcher";
import { getDate, getTime, paginationValues, userActivity } from "../helper/functions.js";
import Counter from "../helper/counter.js";
import { ACCOUNT_HEAD, ACCOUNT_SUBHEAD, COLLECTIONS } from "../config.js";


export const createSupplier = asyncErrorHandler(async (req) => {
  let { name, company, email, mobile, address, gstIn, accountNo, bank, branch, state } = req.body;
  if (isNull(name)) throw new Error("Supplier name required", 400);
  if (isNull(company)) throw new Error("Company name required", 400); 
  if (isNull(mobile)) throw new Error("Mobile required", 400);
  if (isNull(state)) throw new Error("State required", 400);
  if (isNull(gstIn)) throw new Error("GSTIN required", 400);

  const counter = new Counter("Supplier");
  const uniqueId = await counter.uniqueId("SP", moment().format("MMYY"));
  await counter.save();

  let data = await models.Supplier({
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
  }).save();

  if (!data) throw new Error("Failed to create", 400);

   const chartOfAccount = await models.ChartOfAccount.create({
    head:ACCOUNT_HEAD.EXPENSE , 
    subHead: ACCOUNT_SUBHEAD.SUPPLIER_ACCOUNT,
    name: `${name} - Office Account`,
    uniqueId,
    balance: 0,
    status: 0, 
    addedBy: req.user._id,
  });

  userActivity(req, "Supplier created", `Supplier "${name} - ${uniqueId}" created by ${req.user.firstName || ""} ${req.user.lastName || ""}`);
  return new Response("Supplier created successfully", null, 200);
})


export const updateSupplier = asyncErrorHandler(async (req) => {
  let { id, name, company, email, mobile, address, gstIn, accountNo, bank, branch, state } = req.body;
  if (isNull(id)) throw new Error("Product not found", 400);
  if (isNull(name)) throw new Error("Supplier name required", 400);
  if (isNull(company)) throw new Error("Company name required", 400);
  if (isNull(mobile)) throw new Error("Mobile required", 400);
  if (isNull(state)) throw new Error("State required", 400);
  if (isNull(gstIn)) throw new Error("GSTIN required", 400);


  let data = {
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
    updatedBy: req.user._id,
    upTime: getTime(),
    upDate: getDate(),
  };

  let updated = await models.Supplier.findOneAndUpdate({ _id: id, status: { $ne: 1 } }, data);
  if (!updated) throw new Error("Failed to update", 400);
  userActivity(req, "Supplier updated", `Supplier "${name} - ${updated?.uniqueId}" updated by ${req.user.firstName || ""} ${req.user.lastName || ""}`);
  return new Response("Supplier updated successfully", null, 200);
})


export const getSuppliers = asyncErrorHandler(async (req) => {
  let { skip, limit } = paginationValues(req.query);
  let { search } = req.query;
  let condition = { status: { $ne: 1 } }

  if (!isNull(search)) {
    condition.$or = [
      { name: { $regex: search, $options: "i" } },
      { uniqueId: { $regex: search, $options: "i" } },
      { company: { $regex: search, $options: "i" } },
    ]
  }

  let count = await models.Supplier.countDocuments(condition);
  let data = await models.Supplier.find(condition,
    "name company email mobile address gstIn accountNo bank branch status date uniqueId",
  )
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit)
    .populate("state", "name")
    .populate("addedBy", { name: CONCAT_NAME });

  return new Response(null, { count, data }, 200);
})


export const getSupplierDetails = asyncErrorHandler(async (req) => {
  let { id } = req.query;
  if (isNull(id)) throw new Error("Supplier not found", 400);
  let condition = { _id: id, status: { $ne: 1 } }

  let data = await models.Supplier.findOne(condition,
    "name company email mobile address gstIn accountNo bank branch status date uniqueId",
  )
    .populate("state", OPTIONS_FIELD);

  return new Response(null, { data }, 200);
})


export const deleteSupplier = asyncErrorHandler(async (req) => {
  let { id } = req.query;
  if (isNull(id)) throw new Error("Supplier not found", 400);

  let data = {
    status: 1,
    updatedBy: req.user._id,
    upTime: getTime(),
    upDate: getDate(),
  };

  let updated = await models.Supplier.findOneAndUpdate({ _id: id, status: { $ne: 1 } }, data);
  if (!updated) throw new Error("Failed to delete", 400);
  userActivity(req, "Supplier deleted", `Supplier "${updated?.name} - ${updated?.uniqueId}" deleted by ${req.user.firstName || ""} ${req.user.lastName || ""}`);
  return new Response("Supplier deleted successfully", null, 200);
})


export const statusChange = asyncErrorHandler(async (req) => {
  let { id, status } = req.body;
  if (isNull(id)) throw new Error("Supplier not found", 400);
  if (isNull(status)) throw new Error("Status not found", 400);
  if (status != 0 && status != 2) throw new Error("Invalid status", 400);


  let data = {
    status,
    updatedBy: req.user._id,
    upDate: getDate(),
    upTime: getTime()
  }

  let updated = await models.Supplier.findOneAndUpdate({ _id: id, status: { $ne: 1 } }, data);
  userActivity(req, `Supplier status changed`, `Supplier "${updated?.name}" status changed by ${req.user.firstName || ""} ${req.user.lastName || ""}`)
  return new Response("Supplier status changed successfully", null, 200);
})



function snsr(){
console.log("snsr",ACCOUNT_HEAD.EXPENSE)
}

snsr()
