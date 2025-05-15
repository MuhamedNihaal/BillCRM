import { asyncErrorHandler, Response, Error } from "express-error-catcher";
import { checkObjectIdValid, existedValue, paginationValues, validateSpaceAndLetters } from "../helper/functions.js";
import models from "../models/index.js";
import { customerSchema } from "../utils/validation/customer.validation.js";
import Counter from "../helper/counter.js";
import moment from "moment";

export const listCustomer = asyncErrorHandler(async (req, res) => {
  let { skip, limit } = paginationValues(req.query);
  let { search, gender } = req.query;
  let condition = { status: 0 };

  if (!isNull(search)) {
    condition.$or = [
      { firstName: { $regex: search, $options: "i" } },
      { lastName: { $regex: search, $options: "i" } },
      { mobile: { $regex: search, $options: "i" } },
    ];
  }

  if (!isNull(gender) && ["1", "2", "3"].includes(gender)) {
    condition.gender = Number(gender);
  }

  let count = await models.Customer.countDocuments(condition);
  let data = await models.Customer.find(condition)
    .lean()
    .populate("category", OPTIONS_FIELD)
    .populate(
      "country",
      Object.freeze({
        name: "$name",
        label: "$name",
        value: "$_id",
        _id: "$_id",
        country: "$id",
      })
    )
    .populate("district", OPTIONS_FIELD)
    .populate("state", OPTIONS_FIELD)
    .populate(
      "members.member",
      Object.freeze({
        _id: "$_id",
        name: CONCAT_NAME_2,
        label: CONCAT_NAME_2,
        value: "$mobile",
        dob: "$dob",
      })
    )
    .populate("members.relation", OPTIONS_FIELD)
    .populate("addedBy", "firstName lastName username")
    .populate("updatedBy", "firstName lastName username")
    .sort({ createdAt: -1 })
    .select("-__v -createdAt -updatedAt -status -appToken -appUser -version")
    .skip(skip)
    .limit(limit);
  return new Response("customer list", { count, data }, 200);
});

export const addCustomer = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let payload = await customerSchema(req.body);

  if (payload?.error) {
    throw new Error(payload.error, 400);
  }

  let counter = new Counter("customer");
  payload.uniqueId = await counter.uniqueId("C", moment().format("YYMMDD"));
  await counter.save();

  await models.Customer(payload).save();
  return new Response("Customer added successfully", null, 200);
});

export const updateCustomer = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let id = req.params.id;
  if (!checkObjectIdValid(id)) {
    throw new Error("Invalid Customer provided", 400);
  }

  let payload = await customerSchema(req.body, true);

  if (payload?.error) {
    throw new Error(payload.error, 400);
  }

  await models.Customer.findOneAndUpdate({ status: 0, _id: id }, payload);

  return new Response("Customer updated successfully", null, 200);
});

export const removeCustomer = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;

  let id = req.params.id;

  if (!isNull(id)) {
    if (!checkObjectIdValid(id)) {
      throw new Error("Invalid Customer provided", 400);
    }

    await models.Customer.findOneAndUpdate({ status: 0, _id: id }, { status: 1, updatedBy: userId });
  } else {
    let ids = req.queryPolluted.id;

    await models.Customer.updateMany({ status: 0, _id: { $in: ids } }, { status: 1, updatedBy: userId });
  }
  return new Response("Customer removed successfully", null, 200);
});

// customer category handling route
export const listCustomerCategory = asyncErrorHandler(async (req, res) => {
  let { skip, limit } = paginationValues(req.query);
  let { search } = req.query;
  let condition = { status: 0 };

  if (!isNull(search)) {
    condition.name = { $regex: search, $options: "i" };
  }

  let count = await models.CustomerCategory.countDocuments(condition);
  let data = await models.CustomerCategory.find(condition)
    .lean()
    .populate("addedBy", "firstName lastName username")
    .populate("updatedBy", "firstName lastName username")
    .sort({ createdAt: -1 })
    .select("-__v -createdAt -updatedAt -status")
    .skip(skip)
    .limit(limit);
  return new Response("customer category list", { count, data }, 200);
});

export const addCustomerCategory = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { name } = req.body;

  let validName = validateSpaceAndLetters(name);

  let isAlreadyUsed = await models.CustomerCategory.findOne({
    status: 0,
    name: { $regex: new RegExp(`^${validName}$`, "i") },
  });

  if (isAlreadyUsed) {
    throw new Error("This name already in use", 400);
  }

  await models.CustomerCategory({ name: name, uniqueName: validName, addedBy: userId }).save();
  return new Response("Customer category added successfully", null, 201);
});

export const updateCustomerCategory = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let id = req.params?.id;
  if (!checkObjectIdValid(id)) {
    throw new Error("Invalid customer category provided", 400);
  }
  let isValidId = await models.CustomerCategory.findOne({ status: 0, _id: id });
  if (!isValidId) {
    throw new Error("Invalid customer category provided", 400);
  }

  let { name } = req.body;

  let validName = validateSpaceAndLetters(name);
  let isAlreadyUsed = await models.CustomerCategory.findOne({
    _id: { $ne: id },
    status: 0,
    name: { $regex: new RegExp(`^${validName}$`, "i") },
  });

  if (isAlreadyUsed) {
    throw new Error("This name already in use", 400);
  }

  await models.CustomerCategory.findOneAndUpdate({ _id: id, status: 0 }, { name: name, uniqueName: validName, updatedBy: userId });
  return new Response("Customer category updated successfully", null, 200);
});

export const removeCustomerCategory = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let id = req.params.id;
  if (!checkObjectIdValid(id)) {
    throw new Error("Invalid Customer category provided", 400);
  }

  await models.CustomerCategory.findOneAndUpdate({ status: 0, _id: id }, { status: 1, updatedBy: userId });
  return new Response("Customer removed successfully", null, 200);
});
