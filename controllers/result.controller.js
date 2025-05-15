import { asyncErrorHandler, Response, Error } from "express-error-catcher";
import moment from "moment";
import { checkObjectIdValid, paginationValues } from "../helper/functions.js";
import models from "../models/index.js";
import { COLLECTIONS } from "../config.js";

export const resultList = asyncErrorHandler(async (req) => {
  let { skip, limit } = paginationValues(req.query);

  let { date, billId, visitId, patient, staff, result } = req.query;

  let condition = { status: 0 };

  const fieldMap = {
    date,
    billId,
    visitId,
    patient,
    addedBy: staff,
    result,
  };

  for (const [key, value] of Object.entries(fieldMap)) {
    if (key == "result" && ["1", "2"].includes(result)) {
      condition[key] = Number(value);
    } else if (key != "result") {
      if (!isNull(value)) condition[key] = value;
    }
  }

  let count = await models.Billing.countDocuments(condition);
  let data = await models.Billing.find(condition)
    .sort({ createdAt: -1 })
    .select("-__v -createdAt -updatedAt -status -test")
    .skip(skip)
    .limit(limit)
    .populate("patient", "firstName lastName mobile email")
    .populate("corporate", "name email mobile")
    .populate("addedBy", "firstName lastName username");

  return new Response("Result lists", { count, data }, 200);
});

export const resultTest = asyncErrorHandler(async (req) => {
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid result provided", 400);
  let isValidBill = await models.Billing.findOne({ status: 0, _id: id });
  if (!isValidBill) throw new Error("Invalid result provided", 400);

  let data = await models.BillingTests.aggregate([
    {
      $match: {
        status: 0,
        bill: ObjectId(id),
      },
    },
    // {
    //   $lookup: {
    //     from: COLLECTIONS.BILLING,
    //     localField: "bill",
    //     foreignField: "_id",
    //     as: "bill",
    //   },
    // },
    {
      $lookup: {
        from: COLLECTIONS.CUSTOMER,
        localField: "patient",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              firstName: 1,
              lastName: 1,
              mobile: 1,
              email: 1,
            },
          },
        ],
        as: "patient",
      },
    },
    {
      $lookup: {
        from: COLLECTIONS.TEST,
        localField: "test",
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              name: 1,
              type: 1,
              department: 1,
              method: 1,
              unit: 1,
              targetMachine: 1,
              analysisType: 1,
              duration: 1,
              shortCode: 1,
              cost: 1,
              investigation: 1,
              services: 1,
              individual: 1,
              graph: 1,
              fasting: 1,
              referenceRange: 1,
              referenceRanges: 1,
              consumables: 1,
              description: 1,
            },
          },
        ],
        as: "test",
      },
    },
    {
      $project: {
        _id: 1,
        patient: { $first: "$patient" },
        // bill: { $first: "$bill" },
        tests: { $first: "$test" },
        amount: 1,
        reportDate: 1,
        reportTime: 1,
        transferred: 1,
        branch: 1,
        subBranch: 1,
        franchise: 1,
        branchType: 1,
      },
    },
  ]);
  
  return new Response("Result Action", { data: data[0] ?? {} }, 200);
});
