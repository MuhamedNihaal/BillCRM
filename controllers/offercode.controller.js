import moment from "moment";
import models from "../models/index.js";
import { asyncErrorHandler, Error, Response } from "express-error-catcher";
import {
  getDate,
  getTime,
  paginationValues,
  userActivity,
} from "../helper/functions.js";
import { COLLECTIONS } from "../config.js";

export const offerCodeCronJobController = async () => {
  try {
    const currentDate = moment().format("YYYY-MM-DD");

    await models.OfferCode.updateMany(
      {
        validTo: { $lt: currentDate },
        status: 0,
      },
      {
        $set: { status: 2 },
      }
    );

    await models.OfferCode.updateMany(
      {
        validFrom: currentDate,
        status: 2,
      },
      {
        $set: { status: 0 },
      }
    );
  } catch (error) {
    console.error("Error updating offer codes status:", error);
  }
};

export const addOfferCode = asyncErrorHandler(async (req) => {
  let {
    name,
    code,
    type,
    amountOrPercentage,
    maxLimit,
    allotedAmount,
    validFrom,
    validTo,
    remarks,
  } = req.body;

  if (
    isNull(name) ||
    isNull(code) ||
    isNull(type) ||
    isNull(amountOrPercentage) ||
    isNull(maxLimit) ||
    isNull(allotedAmount) ||
    isNull(validFrom) ||
    isNull(validTo)
  ) {
    throw new Error("Please fill in all the required fields", 400);
  }

  let isExists = await models.OfferCode.findOne({
    status: { $ne: 1 },
    $or: [
      { name: { $regex: new RegExp(`^${name}$`, "i") } },
      { code: { $regex: new RegExp(`^${code}$`, "i") } },
    ],
  });

  if (isExists && isExists.name?.toLowerCase() == name.toLowerCase()) {
    throw new Error("Name already exists.", 400);
  } else if (isExists && isExists.code?.toLowerCase() == code.toLowerCase()) {
    throw new Error("Code already exists.", 400);
  }

  let data = await models
    .OfferCode({
      ip: req.ip,
      name,
      code,
      type,
      maxLimit,
      allotedAmount,
      amountOrPercentage,
      remarks,
      validFrom,
      validTo,
      addedBy: req.user._id,
    })
    .save();

  if (!data) throw new Error("Failed to create, Please try again");

  userActivity(
    req,
    "Offer Code added",
    `Offer Code '${name}' added by ${req.user.username || ""}`
  );
  return new Response("Offercode added successfully.", null, 200);
});

export const updateOfferCode = asyncErrorHandler(async (req, res) => {
  let {
    id,
    name,
    code,
    type,
    amountOrPercentage,
    maxLimit,
    allotedAmount,
    validFrom,
    validTo,
    remarks,
  } = req.body;

  if (
    isNull(name) ||
    isNull(code) ||
    isNull(type) ||
    isNull(amountOrPercentage) ||
    isNull(maxLimit) ||
    isNull(allotedAmount) ||
    isNull(validFrom) ||
    isNull(validTo)
  ) {
    throw new Error("Please fill in all the required fields", 400);
  }

  let isExists = await models.OfferCode.findOne({
    status: { $ne: 1 },
    _id: { $ne: id },
    $or: [
      { name: { $regex: new RegExp(`^${name}$`, "i") } },
      { code: { $regex: new RegExp(`^${code}$`, "i") } },
    ],
  });

  if (isExists && isExists.name?.toLowerCase() == name.toLowerCase()) {
    throw new Error("Name already exists.", 400);
  } else if (isExists && isExists.code?.toLowerCase() == code.toLowerCase()) {
    throw new Error("Code already exists.", 400);
  }

  let date = getDate();
  let data = {
    name,
    code,
    type,
    maxLimit,
    allotedAmount,
    amountOrPercentage,
    remarks,
    validFrom,
    validTo,
    updatedBy: req.user._id,
    upDate: date,
    upTime: getTime(),
  };

  if (validFrom > date) {
    data.status = 2;
  } else if (validTo >= date) {
    data.status = 0;
  }

  const updated = await models.OfferCode.findByIdAndUpdate(id, data);
  if (!updated) throw new Error("Failed to update, Please try again");

  userActivity(
    req,
    "Offer Code updated",
    `Offer Code '${name}' updated by ${req.user.username || ""}`
  );
  return new Response("Offercode updated successfully", null, 200);
});

export const details = asyncErrorHandler(async (req) => {
  const { id } = req.query;
  if (!id) throw new Error("Offer Code not found", 400);

  const data = await models.OfferCode.findOne(
    { _id: id, status: { $ne: 1 } },
    {
      name: 1,
      code: 1,
      type: 1,
      maxLimit: 1,
      allotedAmount: 1,
      amountOrPercentage: 1,
      validFrom: 1,
      validTo: 1,
      remarks: 1,
      date: 1,
      time: 1,
      status: 1,
    }
  ).populate("addedBy", { name: CONCAT_NAME });

  return new Response(null, { data }, 200);
});

export const listOfferCode = asyncErrorHandler(async (req, res) => {
  const { validFrom, validTo, status, type } = req.query;
  let { skip, limit } = paginationValues(req.query);

  let condition = {
    status: { $ne: 1 },
  };

  if (!isNull(validFrom)) condition.validFrom = { $gte: validFrom };
  if (!isNull(validTo)) condition.validTo = { $lte: validTo };
  if (status == 0 || status == 2) condition.status = Number(status);
  if (type == 0 || type == 1) condition.type = Number(type);

  const count = await models.OfferCode.countDocuments(condition);

  const data = await models.OfferCode.aggregate([
    { $match: condition },
    { $sort: { _id: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $project: {
        name: 1,
        code: 1,
        type: 1,
        amountOrPercentage: 1,
        status: 1,
        allotedAmount: 1,
        remarks: 1,
        availedCount: 1,
        availedAmount: 1,
        validFrom: 1,
        validTo: 1,
        maxLimit: 1,
        date: 1,
      },
    },
  ]);

  return new Response("Success", { count, data }, 200);
});

export const deleteOfferCode = asyncErrorHandler(async (req, res) => {
  const id = req.query.id;
  if (isNull(id)) throw new Error("Offer code not found.", 400);

  const deleted = await models.OfferCode.findByIdAndUpdate(id, {
    $set: {
      status: 1,
      updatedBy: req.user._id,
      upDate: getDate(),
      upTime: getTime(),
    },
  });

  if (!deleted) throw new Error("Failed to delete, please try again");
  userActivity(
    req,
    "Offer Code deleted",
    `Offer Code '${deleted.name}' deleted by ${req.user.username || ""}`
  );
  return new Response("Offercode deleted successfully.", null, 200);
});

export const statusChange = asyncErrorHandler(async (req) => {
  const { id, status } = req.body;
  if (isNull(id)) throw new Error("Offercode not found", 400);
  if (isNull(status)) throw new Error("Status required.", 400);
  if (status !== 0 && status !== 2) throw new Error("Invalid status.", 400);

  let currentDate = getDate();
  let statusText = "Inactive";
  if (status === 0) {
    let offerCode = await models.OfferCode.findById(id);
    if (offerCode?.validTo < currentDate) {
      throw new Error("Coupon expired. Status change is not allowed.", 400);
    } else if (offerCode?.validFrom > currentDate) {
      throw new Error(
        "Coupon is not yet valid. Status change is not allowed.",
        400
      );
    }
    statusText = "Active";
  }

  const data = await models.OfferCode.findByIdAndUpdate(id, {
    status,
    updatedBy: req.user._id,
    upDate: currentDate,
    upTime: getTime(),
  });

  if (!data) throw new Error("Failed to update, please try again");
  userActivity(
    req,
    `Offer Code status changed to ${statusText}`,
    `Offer Code '${data.name}' status changed to ${statusText} by ${
      req.user.username || ""
    }`
  );
  return new Response(
    `Offercode status changed to ${statusText} successfully.`,
    null,
    200
  );
});

export const logList = asyncErrorHandler(async (req) => {
  const { offerCode, from, to } = req.query;

  const { skip, limit } = paginationValues(req.query);

  const condition = {};
  if (!isNull(offerCode)) condition.offerCode = offerCode;
  if (!isNull(from)) condition.date = { $gte: from };
  if (!isNull(to)) condition.date = { ...condition.date, $lte: to };

  const count = await models.OffercodeLog.countDocuments(condition);
  const data = await models.OffercodeLog.find(condition, {
    date: 1,
    time: 1,
    availedAmount: 1,
    status: 1,
    branchType: 1,
  })
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit)
    .populate("offerCode", "name")
    .populate("customer", "name uniqueId")
    // .populate("bill", "uniqueId")
    .populate("branch", "name")
    .populate("collectionCenter", "name")
    .populate("addedBy", { name: CONCAT_NAME });

  return new Response("Success", { count, data }, 200);
});

export const offerCodeOptions = asyncErrorHandler(async (req) => {
  let { from, to } = req.query;
  let condition = {};

  if (!isNull(from)) condition.date = { $gte: from };
  if (!isNull(to)) condition.date = { ...condition.date, $lte: to };

  const data = await models.OffercodeLog.aggregate([
    {
      $match: condition,
    },
    {
      $group: {
        _id: "$offerCode",
      },
    },
    {
      $lookup: {
        from: COLLECTIONS.OFFER_CODE,
        localField: "_id",
        foreignField: "_id",
        as: "data",
      },
    },
    { $unwind: "$data" },
    { $sort: { _id: -1 } },
    {
      $project: {
        label: "$data.name",
        code: "$data.code",
        value: "$_id",
      },
    },
  ]);

  return new Response("Success", { data }, 200);
});

export const verifyOfferCode = asyncErrorHandler(async (req) => {
  let offerCode = req.query.code;

  let currentDate = getDate();

  let isValidCode = await models.OfferCode.findOne({
    status: 0,
    code: { $regex: new RegExp(`^${offerCode}$`, "i") },
    validTo: { $gte: currentDate },
  }).select(
    "type amountOrPercentage code name maxLimit allotedAmount availedAmount"
  );

  if (!isValidCode) {
    throw new Error(`invalid offer code: ${String(offerCode)}`, 400);
  }

  if (isValidCode?.availedAmount >= isValidCode?.allotedAmount) {
    throw new Error(`offer code limit reached: ${String(offerCode)}`, 400);
  }

  return new Response("valid", { data: isValidCode}, 200);
});
