import { asyncErrorHandler, Response, Error } from "express-error-catcher";
import { ACCOUNT_HEAD, ACCOUNT_SUBHEAD, COLLECTIONS } from "../config.js";
import models from "../models/index.js";
import moment from "moment";
import { isValidObjectId } from "mongoose";
import { CompanySchema } from "../utils/validation.yup.js";
import Counter from "../helper/counter.js";
import { getDate, getTime, paginationValues, userActivity } from "../helper/functions.js";


export const createCompany = asyncErrorHandler(async (req) => {
  let data = await CompanySchema(req.body);

  if (data.error) {
    throw new Error(data.error, 400);
  }

  if (isNull(req.body.slab)) throw new Error("Slab price required", 400);
  let isExists = await models.Company.findOne({ mobile: data.mobile, status: { $ne: 1 } })
  if (isExists) throw new Error("Company with same mobile number already exists", 400);

  const counter = new Counter("company");
  const uniqueId = await counter.uniqueId("CM", moment().format("MMYY"))
  await counter.save();
  data.uniqueId = uniqueId;
  data.addedBy = req.user._id;

  let inserted = await models.Company(data).save();
  data.company = inserted?._id

  const branchCounter = new Counter("branch");
  const branchUniqueId = await branchCounter.uniqueId("BR", moment().format("MMYY"))
  await branchCounter.save();
  data.uniqueId = branchUniqueId;
  data.slab = req.body.slab;

  let branch = await models.Branch(data).save();

  const officeAccountCounter = new Counter("ChartOfAccount");
  const officeAccountUniqueId = await officeAccountCounter.uniqueId("CA", moment().format("MMYY"));
  officeAccountCounter.save();

  const officeAccountData = {
    addedBy: req.user._id,
    name: data.name + " - Office Account",
    uniqueId: officeAccountUniqueId,
    date: moment().format("YYYY-MM-DD"),
    head: ACCOUNT_HEAD.BANK,
    subHead: ACCOUNT_SUBHEAD.OFFICE_ACCOUNT,
    branch: branch?._id,
    company: data.company,
  };
  const officeAccount = await models.ChartOfAccount(officeAccountData).save();

  branch.officeAccount = officeAccount?._id
  await branch.save();

  userActivity(req, "Company & Branch created", `Company & Branch "${data.name}" created by ${req.user.firstName || ""} ${req.user.lastName || ""}`)
  return new Response("Company created successfully", null, 200);
})

export const updateCompany = asyncErrorHandler(async (req) => {
  let { id } = req.body;
  if (isNull(id)) throw new Error("Company not found", 400);

  let data = await CompanySchema(req.body);
  if (data.error) {
    throw new Error(data.error, 400);
  }

  let isExists = await models.Company.findOne({ mobile: data.mobile, status: { $ne: 1 }, _id: { $ne: id } })
  if (isExists) throw new Error("Company with same mobile number already exists", 400);

  data.updatedBy = req.user._id;
  data.upDate = getDate();
  data.upTime = getTime()

  let updated = await models.Company.findByIdAndUpdate(id, data);
  userActivity(req, "Company updated", `Company ${updated.uniqueId} updated by ${req.user.firstName || ""} ${req.user.lastName || ""}`)
  return new Response("Company updated successfully", null, 200);
})

export const listCompanies = asyncErrorHandler(async (req) => {
  let { skip, limit } = paginationValues(req.query);
  let { search } = req.query;

  let condition = { status: { $ne: 1 } }

  if (!isNull(search)) {
    condition.$or = [
      { name: { $regex: search, $options: "i" } },
      { mobile: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { uniqueId: { $regex: search, $options: "i" } },
    ]
  }

  let count = await models.Company.countDocuments(condition);
  let data = await models.Company.find(
    condition,
    {
      name: 1,
      uniqueId: 1,
      mobile: 1,
      email: 1,
      logo: 1,
      contactPerson: 1,
      status: 1,
      date: 1,
      website: 1,
      designation: 1,
      address: 1,
    }
  ).sort({ _id: -1 })
    .skip(skip)
    .limit(limit)
    .populate("addedBy", { name: CONCAT_NAME });

  return new Response(null, { count, data }, 200);
})

export const listForUpdate = asyncErrorHandler(async (req) => {
  let { id } = req.params;
  if (!isValidObjectId(id)) throw new Error("Company not found", 400);

  let condition = { _id: id, status: { $ne: 1 } }

  let data = await models.Company.findOne(
    condition,
    {
      name: 1,
      mobile: 1,
      email: 1,
      logo: 1,
      contactPerson: 1,
      designation: 1,
      website: 1,
      address: 1,
    }
  )
    .populate("state", OPTIONS_FIELD)
    .populate("district", OPTIONS_FIELD).lean();

  return new Response(null, { data }, 200);
})

export const listDetails = asyncErrorHandler(async (req) => {
  let { id } = req.query;
  if (!isValidObjectId(id)) throw new Error("Company not found", 400);

  let condition = { _id: id, status: { $ne: 1 } }

  let data = await models.Company.findOne(
    condition,
    {
      name: 1,
      uniqueId: 1,
      mobile: 1,
      email: 1,
      logo: 1,
      contactPerson: 1,
      designation: 1,
      website: 1,
      address: 1,
      status: 1,
      date: 1,
      time: 1,
    }
  )
    .populate("addedBy", { name: CONCAT_NAME })
    .populate("state", "name")
    .populate("district", "name").lean();

  return new Response(null, { data }, 200);
})

export const deleteCompany = asyncErrorHandler(async (req) => {
  let { id } = req.query
  if (isNull(id)) throw new Error("Company not found", 400);

  let data = await models.Company.findOneAndUpdate({ _id: id }, { status: 1 })
  if (!data) throw new Error("Failed to delete, Please try again", 400);

  await models.Branch.updateMany({ company: id }, { status: 1 })
  await models.User.updateMany({ company: id }, { status: 1 })

  userActivity(req, "Company deleted", `Company "${data.uniqueId}" deleted by ${req.user.firstName || ""} ${req.user.lastName || ""}`)
  return new Response("Company deleted successfully", null, 200);
})

export const changeStatus = asyncErrorHandler(async (req) => {
  let { id, status } = req.body;
  if (isNull(id)) throw new Error("Company not found", 400);
  if (isNull(status)) throw new Error("Status not found", 400);
  if (status != 0 && status != 2) throw new Error("Invalid status", 400);

  let update = {
    status,
    updatedBy: req.user._id,
    upDate: getDate(),
    upTime: getTime(),
  }

  let data = await models.Company.findByIdAndUpdate(id, update)
  if (!data) throw new Error("Failed to update, Please try again", 400);

  userActivity(req, `Company status changed`, `Company "${data.uniqueId}" status changed by ${req.user.firstName || ""} ${req.user.lastName || ""}`)
  return new Response(`Company status changed successfully`, null, 200);
})