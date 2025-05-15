import { asyncErrorHandler, Response, Error } from "express-error-catcher";
import moment from "moment";
import { checkObjectIdValid, paginationValues, validateOfferCode, validateSpaceAndLetters } from "../helper/functions.js";
import models from "../models/index.js";
import { discountRequestSchema } from "../utils/validation/billing.validation.js";
import { emitToSpecificUser } from "../socket/utils.js";
import { COLLECTIONS, DISCOUNT_APPROVER } from "../config.js";

export const addRequest = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let employeeName = `${req.user?.firstName} ${req.user?.lastName}`;
  let payload = await discountRequestSchema(req.body);

  if (payload.error) {
    throw new Error(payload.error, 400);
  }

  let { offerCode } = payload;

  if (!isNull(offerCode)) {
    await validateOfferCode(offerCode);
  }

  payload.addedBy = userId;
  await models.DiscountRequest(payload).save();

  let requestAcceptors = Object.values(DISCOUNT_APPROVER);

  const acceptingUsers = await models.User.find({
    privilege: { $in: requestAcceptors },
  });

  res.status(200).json({ message: "Successfully discount request initiated" });

  if (acceptingUsers.length > 0) {
    acceptingUsers.forEach(({ _id }) => {
      emitToSpecificUser(_id, "discount-request", {
        refresh: true,
        employeeName,
        discount: payload?.discount,
      });
    });
  }
});

export const cancelRequest = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { name } = req.body;

  let validName = validateSpaceAndLetters(name);
  let isAlreadyUsed = await models.Units.findOne({
    uniqueName: validName,
    status: 0,
  });

  if (isAlreadyUsed) throw new Error("this name already in use", 400);

  await models.Units({ name: name, uniqueName: validName, addedBy: userId }).save();

  return new Response("Successfully units added", null, 201);
});

export const discountList = asyncErrorHandler(async (req, res) => {
  let { skip, limit } = paginationValues(req.query);
  let { search, status } = req.query;
  let formatDate = moment().subtract(2, "minutes").format("YYYY-MM-DD HH:mm:ss");

  let condition = {};

  if (["1", "2", "3", "4"].includes(status)) {
    condition.status = Number(status);
  }

  if (!isNull(search)) {
    condition.name = { $regex: search, $options: "i" };
  }

  let lookupFunc = (collection, name) => {
    return {
      $lookup: {
        from: collection,
        localField: name,
        foreignField: "_id",
        pipeline: [
          {
            $project: {
              firstName: 1,
              lastName: 1,
            },
          },
        ],
        as: name,
      },
    };
  };

  let count = await models.DiscountRequest.countDocuments(condition);
  let data = await models.DiscountRequest.aggregate([
    { $match: condition },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    lookupFunc(COLLECTIONS.CUSTOMER, "patient"),
    lookupFunc(COLLECTIONS.USER, "addedBy"),
    lookupFunc(COLLECTIONS.USER, "updatedBy"),
    {
      $project: {
        uniqueId: 1,
        patient: { $first: "$patient" },
        addedBy: { $first: "$addedBy" },
        updatedBy: { $first: "$updatedBy" },
        total: 1,
        dateAndTime: {
          $concat: ["$date", " ", "$time"],
        },
        cStatus: {
          $cond: {
            if: {
              $and: [
                { $in: ["$status", [3, 4]] },
                {
                  $gte: [
                    formatDate,
                    {
                      $concat: ["$date", " ", "$time"],
                    },
                  ],
                },
              ],
            },
            then: 4,
            else: "$status",
          },
        },
        status: 1,
        discount: 1,
        adjAmount: 1,
        grandTotal: 1,
        date: 1,
        time: 1,
      },
    },
  ]);

  res.status(200).json({ count, data });

  let expireButNotStatusUpdated = new Set();
  data.forEach((doc) => {
    if (doc.status == 3 && doc?.cStatus === 4) {
      expireButNotStatusUpdated.add(doc._id);
    }
  });

  if (expireButNotStatusUpdated.size > 0) {
    await models.DiscountRequest.updateMany({ _id: { $in: Array.from(expireButNotStatusUpdated) } }, { status: 4 });
  }
});

export const acceptDiscount = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { id, action } = req.body;

  if (!checkObjectIdValid(id)) throw new Error("invalid id provided", 400);
  if (!["approve", "cancel"].includes(action)) throw new Error("invalid action provided", 400);

  let isRequestDiscount = await models.DiscountRequest.findOne({
    _id: id,
    status: 3,
  });

  if (!isRequestDiscount) {
    throw new Error("request data not found", 400);
  }

  let dateAndTime = moment(`${isRequestDiscount.date} ${isRequestDiscount.time}`).format("YYYY-MM-DD HH:mm:ss");

  if (moment().subtract(2, "minutes").isAfter(moment(dateAndTime, "YYYY-MM-DD HH:mm:ss"))) {
    throw new Error("discount request expired", 400);
  }

  emitToSpecificUser(isRequestDiscount?.addedBy, "discount-approved", {
    approved: action === "approve" ? true : false,
    uniqueId: isRequestDiscount.uniqueId,
    discount: action === "approve" ? isRequestDiscount.discount : 0,
    key: isRequestDiscount.key,
  });

  await models.DiscountRequest.findOneAndUpdate({ _id: id }, { status: action == "approve" ? 1 : 2, discountHandler: userId });

  if (action === "cancel") {
    return new Response("Discount cancelled", null, 200);
  } else {
    return new Response("Request Approved", null, 200);
  }
});
