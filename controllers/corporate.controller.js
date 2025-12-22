import { asyncErrorHandler, Error, Response } from "express-error-catcher";
import COLLECTIONS from "@/config/collections.js";

//! Local Import
import models from "@/models/index.js";
import { checkObjectIdValid, Counter, paginationValues, querySearchSanitize } from "@/helper/index.js";
import { corporateSchema } from "@/validation/corporate.validation.js";
import userActivity, { ACTIVITY_ACTIONS } from "@/utils/userActivity.js";

export const listCorporative = asyncErrorHandler(async (req) => {
  let { skip, limit } = paginationValues(req.query);
  let { search, slab } = req.query;

  let condition = { status: 0 };

  if (!isNull(slab)) {
    condition.slab = Number(slab);
  }

  if (!isNull(search)) {
    search = querySearchSanitize(search);
    condition.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { mobile: { $regex: search, $options: "i" } },
      { location: { $regex: search, $options: "i" } },
      { uniqueId: { $regex: search, $options: "i" } },
    ];
  }

  let billCountDetails = await models.Billing.aggregate([
    {
      $match: {
        corporate: { $type: "objectId" },
        status: 0,
      },
    },
    {
      $group: {
        _id: null,
        totalBill: { $sum: 1 },
        totalBillAmount: {
          $sum: "$grandTotal",
        },
        unpaid: {
          $sum: "$creditAmount",
        },
      },
    },
  ]);

  billCountDetails = billCountDetails[0] || {};
  billCountDetails.paid = (billCountDetails?.totalBillAmount ?? 0) - (billCountDetails?.unpaid ?? 0);

  let count = await models.Corporative.countDocuments(condition);
  let data = await models.Corporative.aggregate([
    {
      $match: condition,
    },
    {
      $sort: {
        createdAt: -1,
      },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: COLLECTIONS.STATE,
        localField: "state",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              value: "$_id",
              name: 1,
              label: "$name",
            },
          },
        ],
        as: "state",
      },
    },
    {
      $lookup: {
        from: COLLECTIONS.DISTRICT,
        localField: "district",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              value: "$_id",
              name: 1,
              label: "$name",
            },
          },
        ],
        as: "district",
      },
    },
    {
      $lookup: {
        from: COLLECTIONS.USERS,
        localField: "addedBy",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              firstName: 1,
              lastName: 1,
              username: 1,
            },
          },
        ],
        as: "addedBy",
      },
    },
    {
      $lookup: {
        from: COLLECTIONS.USERS,
        localField: "updatedBy",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              firstName: 1,
              lastName: 1,
              username: 1,
            },
          },
        ],
        as: "updatedBy",
      },
    },
    {
      $lookup: {
        from: COLLECTIONS.BILLING,
        let: { corpId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$corporate", "$$corpId"],
              },
              status: { $ne: 1 },
            },
          },
          {
            $group: {
              _id: null,
              totalBillAmount: {
                $sum: "$grandTotal",
              },
              creditAmount: {
                $sum: "$creditAmount",
              },
              totalBill: { $sum: 1 },
            },
          },
        ],
        as: "billings",
      },
    },
    {
      $addFields: {
        district: {
          $first: "$district",
        },
        state: {
          $first: "$state",
        },
        addedBy: {
          $first: "$addedBy",
        },
        updatedBy: {
          $first: "$updatedBy",
        },
        totalBillAmount: {
          $first: "$billings.totalBillAmount",
        },
        totalBill: {
          $first: "$billings.totalBill",
        },
        creditAmount: {
          $first: "$billings.creditAmount",
        },
      },
    },
    {
      $project: {
        totalBillAmount: 1,
        totalBill: 1,
        creditAmount: 1,

        slab: 1,
        name: 1,
        email: 1,
        mobile: 1,
        location: 1,
        district: 1,
        state: 1,
        status: 1,

        date: 1,
        time: 1,
        addedBy: 1,
        updatedBy: 1,
      },
    },
  ]);

  return new Response(null, { billCountDetails, count, data }, 200);
});

export const getCorporative = asyncErrorHandler(async (req) => {
  let id = req.params.id;
  if (!checkObjectIdValid(id)) {
    throw new Error("Invalid corp id", 400);
  }

  let data = await models.Corporative.findOne({ status: 0, _id: id }, OPTIONS_FIELD);
  if (!data) throw new Error("Corp not found", 404);

  return new Response("Get specific corp", { data }, 200);
});

export const addCorporative = asyncErrorHandler(async (req) => {
  let payload = await corporateSchema(req.body);

  let isMobileRegistered = await models.Corporative.findOne({ mobile: payload.mobile, status: 0 });
  if (isMobileRegistered) throw new Error("This mobile number already is use", 400);

  let counter = new Counter({ counterId: COLLECTIONS.CORPORATE });
  payload.uniqueId = await counter.uniqueId({ prefix: "CRC", identifier: "" });

  payload.addedBy = req?.user?._id;
  let savedData = await new models.Corporative(payload).save();

  userActivity({
    req,
    action: ACTIVITY_ACTIONS.CRUD.CREATE_RECORD,
    description: `Corporate client created by {userName} for [ reference ID: ${payload.uniqueId}]`,
    reference: payload,
  });

  return new Response("Corp client added successfully", { data: savedData?._id }, 201);
});

export const updateCorporative = asyncErrorHandler(async (req) => {
  let id = req.params.id;
  if (!checkObjectIdValid(id)) throw new Error("invalid id provided", 400);

  let payload = await corporateSchema(req.body);

  let isValidCorporate = await models.Corporative.findOne({ _id: id, status: 0 });
  if (!isValidCorporate) {
    throw new Error("This corp client not found", 404);
  }

  let isMobileRegistered = await models.Corporative.findOne({ _id: { $ne: id }, mobile: payload.mobile, status: 0 });
  if (isMobileRegistered) throw new Error("This mobile number already is use", 400);

  payload.updatedBy = req?.user?._id;

  await models.Corporative.findOneAndUpdate({ _id: isValidCorporate._id }, payload);

  userActivity({
    req,
    action: ACTIVITY_ACTIONS.CRUD.UPDATE_RECORD,
    description: `Corporate client updated by {userName} for [ reference ID: ${isValidCorporate.uniqueId}]`,
    reference: payload,
  });

  return new Response("Corp client updated successfully", { _id: id }, 200);
});

export const removeCorporative = asyncErrorHandler(async (req) => {
  let id = req.params.id;
  if (!checkObjectIdValid(id)) throw new Error("invalid id provided", 400);

  let isRemoved = await models.Corporative.findOneAndUpdate({ _id: id, status: 0 }, { status: 1, updatedBy: req?.user._id }).lean();

  if (!isRemoved) throw new Error("Corp client nto found", 404);

  userActivity({
    req,
    action: ACTIVITY_ACTIONS.CRUD.DELETE_RECORD,
    description: `Corporate client removed by {userName} for [ reference ID: ${isRemoved.uniqueId}]`,
  });
  return new Response("Corp client removed successfully", null, 200);
});
