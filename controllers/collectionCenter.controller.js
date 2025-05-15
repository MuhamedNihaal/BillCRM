import { asyncErrorHandler, Response, Error } from "express-error-catcher";
import { ACCOUNT_HEAD, ACCOUNT_SUBHEAD, COLLECTIONS } from "../config.js";
import models from "../models/index.js";
import moment from "moment";
import { isValidObjectId } from "mongoose";
import Counter from "../helper/counter.js";
import { getDate, getTime, paginationValues, userActivity } from "../helper/functions.js";

export const createCollectionCenter = asyncErrorHandler(async (req) => {
  let { name, mobile, email, contactPerson, designation, address, subBranch, state, district, slab } = req.body;

  if (isNull(subBranch)) throw new Error("Sub branch required", 400);
  if (isNull(name)) throw new Error("Name required", 400);
  if (isNull(mobile)) throw new Error("Mobile number required", 400);
  if (isNull(email)) throw new Error("Email required", 400);
  if (isNull(contactPerson)) throw new Error("Contact person required", 400);
  if (isNull(address)) throw new Error("Address required", 400);
  if (isNull(slab)) throw new Error("Slab required", 400);

  let subBranchDetails = await models.Branch.findOne({ _id: subBranch })
  if (!subBranchDetails) throw new Error("Sub Branch not found", 400);

  let counter = new Counter("collectionCenter");
  let uniqueId = await counter.uniqueId("CC", moment().format("MMYY"));
  await counter.save();

  let data = await models.CollectionCenter({
    uniqueId,
    name,
    mobile,
    email,
    contactPerson,
    designation,
    address,
    subBranch,
    mainBranch: subBranchDetails.mainBranch,
    company: subBranchDetails.company,
    state,
    district,
    slab,
    addedBy: req.user._id,
  })

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
    collectionCenter: data?._id,
    company: data.company,
  };
  const officeAccount = await models.ChartOfAccount(officeAccountData).save();

  data.officeAccount = officeAccount?._id
  await data.save();

  userActivity(req, "Collection Center created", `Collection Center ${name}, ${uniqueId} created by ${req.user.firstName || ""} ${req.user.lastName || ""}`)
  return new Response("Collection Center created successfully", null, 200);
})

export const updateCollectionCenter = asyncErrorHandler(async (req) => {
  let { id, name, mobile, email, contactPerson, designation, address, state, district, slab } = req.body;

  if (isNull(name)) throw new Error("Name required", 400);
  if (isNull(mobile)) throw new Error("Mobile number required", 400);
  if (isNull(email)) throw new Error("Email required", 400);
  if (isNull(contactPerson)) throw new Error("Contact person required", 400);
  if (isNull(address)) throw new Error("Address required", 400);
  if (isNull(slab)) throw new Error("Slab required", 400);

  let data = {
    name,
    mobile,
    email,
    contactPerson,
    designation,
    address,
    state,
    district,
    slab,
    upDate: getDate(),
    upTime: getTime(),
    updatedBy: req.user._id,
  }

  let updated = await models.CollectionCenter.findByIdAndUpdate(id, data);
  if (!updated) throw new Error("Failed to update, Please try again", 400);
  userActivity(req, "Collection Center updated", `Collection Center  "${updated.$clearModifiedPathsuniqueId}" updated by ${req.user.firstName || ""} ${req.user.lastName || ""}`)
  return new Response("Collection Center updated successfully", null, 200);
})

export const deleteCollectionCenter = asyncErrorHandler(async (req) => {
  let { id } = req.query;
  if (isNull(id)) throw new Error("Collection Center not found", 400);

  let data = {
    status: 1,
    updatedBy: req.user._id,
    upDate: getDate(),
    upTime: getTime()
  }

  let deleted = await models.CollectionCenter.findByIdAndUpdate(id, data);
  if (!deleted) throw new Error("Failed to delete, Please try again", 400);

  userActivity(req, "Collection Center deleted", `Collection Center "${deleted.uniqueId}" deleted by ${req.user.firstName || ""} ${req.user.lastName || ""}`)
  return new Response("Collection Center deleted successfully", null, 200);
})

export const listCollectionCenters = asyncErrorHandler(async (req) => {
  let { skip, limit } = paginationValues(req.query);
  let { search, subBranch } = req.query;
  let condition = { status: { $ne: 1 } };

  if (!isNull(subBranch)) condition.subBranch = subBranch;
  if (!isNull(search)) {
    condition.$or = [
      { name: { $regex: search, $options: "i" } },
      { mobile: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { uniqueId: { $regex: search, $options: "i" } },
    ];
  }

  let count = await models.CollectionCenter.countDocuments(condition);
  let data = await models.CollectionCenter.find(
    condition,
    {
      name: 1,
      uniqueId: 1,
      mobile: 1,
      email: 1,
      contactPerson: 1,
      address: 1,
      slab: 1,
      date: 1,
    }
  )
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit)
    .populate("subBranch", "name")
    .populate("addedBy", { name: CONCAT_NAME });

  return new Response(null, { count, data }, 200);
})

export const listForUpdate = asyncErrorHandler(async (req) => {
  let { id } = req.params;
  if (!isValidObjectId(id)) throw new Error("Collection Center not found", 400);
  let condition = { status: { $ne: 1 }, _id: id };

  let data = await models.CollectionCenter.findOne(
    condition,
    {
      name: 1,
      uniqueId: 1,
      mobile: 1,
      email: 1,
      contactPerson: 1,
      designation: 1,
      address: 1,
      slab: 1,
    }
  )
    .populate("subBranch", OPTIONS_FIELD)
    .populate("state", OPTIONS_FIELD)
    .populate("district", OPTIONS_FIELD)

  return new Response(null, { data }, 200);
})

export const listDetails = asyncErrorHandler(async (req) => {
  let { id } = req.query;
  if (isNull(id)) throw new Error("Collection Center not found", 400);
  let condition = { status: { $ne: 1 }, _id: id };

  let data = await models.CollectionCenter.findOne(
    condition,
    {
      name: 1,
      uniqueId: 1,
      mobile: 1,
      email: 1,
      contactPerson: 1,
      designation: 1,
      address: 1,
      slab: 1,
      date: 1,
      time: 1,
      status: 1,
    }
  )
    .populate("mainBranch", "name")
    .populate("subBranch", "name")
    .populate("state", "name")
    .populate("district", "name")
    .populate("addedBy", {name: CONCAT_NAME})

  return new Response(null, { data }, 200);
})

export const statusChange = asyncErrorHandler(async (req) => {
  let { id, status } = req.body;
  if (isNull(id)) throw new Error("Collection Center not found", 400);
  if (isNull(status)) throw new Error("Status not found", 400);
  if (status != 0 && status != 2) throw new Error("Invalid status", 400);

  let collectionCenter = await models.CollectionCenter.findOne({ _id: id, status: { $ne: 1 } })
  if (!collectionCenter) throw new Error("Collection Center not found", 400);

  let data = {
    status,
    updatedBy: req.user._id,
    upDate: getDate(),
    upTime: getTime()
  }

  let updated = await models.CollectionCenter.findOneAndUpdate({ _id: id, status: { $ne: 1 } }, data);
  userActivity(req, `Collection Center status changed`, `Collection Center "${updated?.name}" status changed by ${req.user.firstName || ""} ${req.user.lastName || ""}`)
  return new Response("Collection Center status changed successfully", null, 200);
})