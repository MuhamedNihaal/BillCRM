import { asyncErrorHandler, Response, Error } from "express-error-catcher";
import { ACCOUNT_HEAD, ACCOUNT_SUBHEAD, COLLECTIONS } from "../config.js";
import models from "../models/index.js";
import moment from "moment";
import { isValidObjectId } from "mongoose";
import { CompanySchema } from "../utils/validation.yup.js";
import Counter from "../helper/counter.js";
import { getDate, getTime, paginationValues, userActivity } from "../helper/functions.js";


export const createBranch = asyncErrorHandler(async (req) => {
  let { company, type, slab } = req.body;
  if (isNull(company)) throw new Error("Company required", 400);
  if (isNull(type)) throw new Error("Please select a branch type", 400);
  if (isNull(slab)) throw new Error("Slab price required", 400);
  if (type == 1) throw new Error("Main branch already exists", 400);
  if (type != 2 && type != 3) throw new Error("Invalid branch type", 400);

  let data = await CompanySchema(req.body);

  if (data.error) {
    throw new Error(data.error, 400);
  }

  let isExists = await models.Branch.findOne({ mobile: data.mobile, status: { $ne: 1 } })
  if (isExists) throw new Error("Branch with same mobile number already exists", 400);

  let mainBranch = await models.Branch.findOne({ company, type: 1, status: 0 })

  const counter = new Counter("branch");
  const uniqueId = await counter.uniqueId("BR", moment().format("MMYY"))
  await counter.save();
  data.uniqueId = uniqueId;
  data.addedBy = req.user._id;
  data.mainBranch = mainBranch?._id;

  let branch = await models.Branch(data);

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

  userActivity(req, "Branch created", `Branch ${data.name} created by ${req.user.firstName || ""} ${req.user.lastName || ""}`)
  return new Response("Branch created successfully", null, 200);
})

export const updateBranch = asyncErrorHandler(async (req) => {
  let { id, slab } = req.body;
  if (isNull(id)) throw new Error("Branch not found", 400);

  let data = await CompanySchema(req.body);
  if (data.error) {
    throw new Error(data.error, 400);
  }

  if (isNull(slab)) throw new Error("Slab price required", 400);

  let isExists = await models.Branch.findOne({ mobile: data.mobile, status: { $ne: 1 }, _id: { $ne: id } })
  if (isExists) throw new Error("Branch with same mobile number already exists", 400);

  delete data.type;
  delete data.company;
  data.updatedBy = req.user._id;
  data.upDate = getDate();
  data.upTime = getTime()

  let updated = await models.Branch.findByIdAndUpdate(id, data);
  userActivity(req, "Branch updated", `Branch ${updated.uniqueId} updated by ${req.user.firstName || ""} ${req.user.lastName || ""}`)
  return new Response("Branch updated successfully", null, 200);
})

export const deleteBranch = asyncErrorHandler(async (req) => {
  let { id } = req.query;
  if (isNull(id)) throw new Error("Branch not found", 400);

  let branch = await models.Branch.findOne({ _id: id, status: { $ne: 1 } })
  if (!branch) throw new Error("Branch not found", 400);
  if (branch.type == 1) throw new Error("Main branch cannot be deleted", 400);

  let data = {
    status: 1,
    updatedBy: req.user._id,
    upDate: getDate(),
    upTime: getTime()
  }

  await models.Branch.findByIdAndUpdate(id, data);
  userActivity(req, "Branch deleted", `Branch "${branch.uniqueId}" deleted by ${req.user.firstName || ""} ${req.user.lastName || ""}`)
  return new Response("Branch deleted successfully", null, 200);
})

export const statusChange = asyncErrorHandler(async (req) => {
  let { id, status } = req.body;
  if (isNull(id)) throw new Error("Branch not found", 400);
  if (isNull(status)) throw new Error("Status not found", 400);
  if (status != 0 && status != 2) throw new Error("Invalid status", 400);

  let branch = await models.Branch.findOne({ _id: id, status: { $ne: 1 } })
  if (!branch) throw new Error("Branch not found", 400);
  if (branch.type == 1) throw new Error("Main branch status cannot be changed", 400);

  let data = {
    status,
    updatedBy: req.user._id,
    upDate: getDate(),
    upTime: getTime()
  }

  let updated = await models.Branch.findOneAndUpdate({ _id: id, status: { $ne: 1 } }, data);
  userActivity(req, `Branch status changed`, `Branch "${updated?.name}" status changed by ${req.user.firstName || ""} ${req.user.lastName || ""}`)
  return new Response("Branch status changed successfully", null, 200);
})

export const listBranches = asyncErrorHandler(async (req) => {
  let { skip, limit } = paginationValues(req.query);
  let { search, company, type } = req.query;
  let condition = { status: { $ne: 1 } };

  if (!isNull(search)) {
    condition.$or = [
      { name: { $regex: search, $options: "i" } },
      { mobile: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { uniqueId: { $regex: search, $options: "i" } },
    ];
  }
  if (!isNull(company)) condition.company = company;
  if (!isNull(type)) condition.type = Number(type);

  let count = await models.Branch.countDocuments(condition);
  let data = await models.Branch.find(
    condition,
    {
      name: 1,
      uniqueId: 1,
      mobile: 1,
      logo: 1,
      contactPerson: 1,
      status: 1,
      date: 1,
      type: 1,
      slab: 1,
    }
  )
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit)
    .populate("company", "name")
    .populate("addedBy", { name: CONCAT_NAME });

  return new Response(null, { count, data }, 200);
})

export const listForUpdate = asyncErrorHandler(async (req) => {
  let { id } = req.params;
  if (!isValidObjectId(id)) throw new Error("Branch not found", 400);

  let condition = { _id: id, status: { $ne: 1 } }

  let data = await models.Branch.findOne(
    condition,
    {
      name: 1,
      mobile: 1,
      email: 1,
      logo: 1,
      contactPerson: 1,
      designation: 1,
      address: 1,
      website: 1,
      slab: 1,
      type: 1,
    }
  )
    .populate("company", OPTIONS_FIELD)
    .populate("state", OPTIONS_FIELD)
    .populate("district", OPTIONS_FIELD).lean();

  return new Response(null, { data }, 200);
})

export const listDetails = asyncErrorHandler(async (req) => {
  let { id } = req.query;
  if (!isValidObjectId(id)) throw new Error("Branch not found", 400);

  let condition = { _id: id, status: { $ne: 1 } }

  let data = await models.Branch.findOne(
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
      slab: 1,
      type: 1,
      status: 1,
      date: 1,
      time: 1,
    }
  )
    .populate("addedBy", { name: CONCAT_NAME })
    .populate("company", "name")
    .populate("state", "name")
    .populate("district", "name").lean();

  return new Response(null, { data }, 200);
})