import moment from "moment";
import models from "../models/index.js";
import { asyncErrorHandler, Error, Response } from "express-error-catcher";
import { getDate, getTime, paginationValues, userActivity } from "../helper/functions.js";
import { COLLECTIONS } from "../config.js";
import Counter from "../helper/counter.js";


export const createProduct = asyncErrorHandler(async (req) => {
  let { name, mrp, specialPrice, gst, cost, primaryUnit, secondaryUnit, secondaryQty, secondaryPrice } = req.body;
  if (isNull(name) || isNull(mrp) || isNull(specialPrice) || isNull(gst) || isNull(cost) || isNull(primaryUnit) || isNull(secondaryUnit) || isNull(secondaryQty) || isNull(secondaryPrice)) {
    throw new Error("Please fill in all the required fields", 400);
  }

  let isExists = await models.Product.findOne({
    status: { $ne: 1 },
    name: { $regex: new RegExp(`^${name}$`, "i") }
  });
  if (isExists) throw new Error("Product already exists.", 400);

  const counter = new Counter("Product");
  const uniqueId = await counter.uniqueId("NB", moment().format("MMYY"));
  await counter.save();

  let data = await models.Product({
    name,
    sku: uniqueId,
    mrp,
    specialPrice,
    gst,
    gstAmount: Number((cost - specialPrice).toFixed(2)),
    cost,
    primaryUnit,
    secondaryUnit,
    secondaryQty,
    secondaryPrice,
    addedBy: req.user._id,
  }).save();

  if (!data) throw new Error("Failed to create", 400);
  userActivity(req, "Product created", `Product "${name} - ${uniqueId}" created by ${req.user.firstName || ""} ${req.user.lastName || ""}`);
  return new Response("Product created successfully", null, 200);
})


export const updateProduct = asyncErrorHandler(async (req) => {
  let { id, name, mrp, specialPrice, gst, cost, primaryUnit, secondaryUnit, secondaryQty, secondaryPrice } = req.body;
  if (isNull(id)) throw new Error("Product not found", 400);
  if (isNull(name) || isNull(mrp) || isNull(specialPrice) || isNull(gst) || isNull(cost) || isNull(primaryUnit) || isNull(secondaryUnit) || isNull(secondaryQty) || isNull(secondaryPrice)) {
    throw new Error("Please fill in all the required fields", 400);
  }

  let isExists = await models.Product.findOne({
    status: { $ne: 1 },
    _id: { $ne: id },
    name: { $regex: new RegExp(`^${name}$`, "i") }
  });
  if (isExists) throw new Error("Product already exists.", 400);


  let data = {
    name,
    mrp,
    specialPrice,
    gst,
    gstAmount: Number((cost - specialPrice).toFixed(2)),
    cost,
    primaryUnit,
    secondaryUnit,
    secondaryQty,
    secondaryPrice,
    updatedBy: req.user._id,
    upTime: getTime(),
    upDate: getDate(),
  };

  let updated = await models.Product.findOneAndUpdate({ _id: id, status: { $ne: 1 } }, data);
  if (!updated) throw new Error("Failed to update", 400);
  userActivity(req, "Product updated", `Product "${name} - ${updated?.uniqueId}" updated by ${req.user.firstName || ""} ${req.user.lastName || ""}`);
  return new Response("Product updated successfully", null, 200);
})


export const getProduct = asyncErrorHandler(async (req) => {
  let { skip, limit } = paginationValues(req.query);
  let { search } = req.query;
  let condition = { status: { $ne: 1 } }

  if (!isNull(search)) {
    condition.$or = [
      { name: { $regex: search, $options: "i" } },
      { sku: { $regex: search, $options: "i" } },
    ]
  }

  let count = await models.Product.countDocuments(condition);
  let data = await models.Product.find(condition,
    "name sku mrp specialPrice gst cost primaryUnit secondaryUnit secondaryQty secondaryPrice status date",
  )
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit)
    .populate("addedBy", { name: CONCAT_NAME });

  return new Response(null, { count, data }, 200);
})


export const getProductDetails = asyncErrorHandler(async (req) => {
  let { id } = req.query;
  if (isNull(id)) throw new Error("Product not found", 400);
  let condition = { _id: id, status: { $ne: 1 } }

  let data = await models.Product.findOne(condition,
    "name sku mrp specialPrice gst cost primaryUnit secondaryUnit secondaryQty secondaryPrice status date",
  );

  return new Response(null, { data }, 200);
})


export const deleteProduct = asyncErrorHandler(async (req) => {
  let { id } = req.query;
  if (isNull(id)) throw new Error("Product not found", 400);

  let data = {
    status: 1,
    updatedBy: req.user._id,
    upTime: getTime(),
    upDate: getDate(),
  };

  let updated = await models.Product.findOneAndUpdate({ _id: id, status: { $ne: 1 } }, data);
  if (!updated) throw new Error("Failed to delete", 400);
  userActivity(req, "Product deleted", `Product "${updated?.name} - ${updated?.uniqueId}" deleted by ${req.user.firstName || ""} ${req.user.lastName || ""}`);
  return new Response("Product deleted successfully", null, 200);
})


export const statusChange = asyncErrorHandler(async (req) => {
  let { id, status } = req.body;
  if (isNull(id)) throw new Error("Product not found", 400);
  if (isNull(status)) throw new Error("Status not found", 400);
  if (status != 0 && status != 2) throw new Error("Invalid status", 400);


  let data = {
    status,
    updatedBy: req.user._id,
    upDate: getDate(),
    upTime: getTime()
  }

  let updated = await models.Product.findOneAndUpdate({ _id: id, status: { $ne: 1 } }, data);
  userActivity(req, `Product status changed`, `Product "${updated?.name}" status changed by ${req.user.firstName || ""} ${req.user.lastName || ""}`)
  return new Response("Product status changed successfully", null, 200);
})