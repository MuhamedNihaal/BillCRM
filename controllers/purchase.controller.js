import moment from "moment";
import models from "@/models/index.js";
import { asyncErrorHandler, Error, Response } from "express-error-catcher";
import {
  paginationValues,
  querySearchSanitize,
  Counter,
} from "@/helper/index.js";

import COLLECTIONS from "@/config/collections.js";

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import ejs from "ejs";
import puppeteer from "puppeteer";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

import { purchaseBodyValidation } from "@/validation/inventory.validation.yup.js";
import getTimeParam from "@/utils/getTimeParam.js";
import userActivity, { ACTIVITY_ACTIONS } from "@/utils/userActivity.js";

// Get supplier options for dropdown
export const supplierOptions = asyncErrorHandler(async (req) => {
  let { search } = req.query;
  let condition = { status: 0 };

  if (search) {
    condition.$or = [
      { name: { $regex: `${search}`, $options: "i" } },
      { company: { $regex: `${search}`, $options: "i" } },
      { uniqueId: { $regex: `${search}`, $options: "i" } },
      { mobile: { $regex: `${search}`, $options: "i" } },
      { email: { $regex: `${search}`, $options: "i" } },
    ];
  }

  let data = await models.Supplier.find(condition, {
    label: "$name",
    value: "$_id",
    name: 1,
    address: 1,
    uniqueId: 1,
    mobile: 1,
    gstIn: 1,
  })
    .populate("state", "name")
    .sort({ name: 1 });

  return new Response(null, { data }, 200);
});

// Get product options for dropdown
export const productOptions = asyncErrorHandler(async (req) => {
  let { search } = req.query;
  let condition = { status: 0 };

  if (search) {
    condition.$or = [
      { name: { $regex: `${search}`, $options: "i" } },
    ];
  }

  let data = await models.Product.find(condition, {
    label: "$name",
    value: "$_id",
    name: 1,
    expiry: 1,
    primaryUnit: 1,
    mrp: 1,
    price: "$specialPrice",
    rate: "$cost",
    gst: 1,
    cost: 1,
  }).sort({ name: 1 });

  return new Response(null, { data }, 200);
});

// Add new purchase
export const addPurchase = asyncErrorHandler(async (req) => {
  if (!req.isAdmin) {
    throw new Error("You are not authorized to add purchase", 400);
  }

  // Validate bill number uniqueness
  const existingPurchase = await models.Purchase.findOne({
    billNum: req.body.billNum,
  }).lean();

  const existingBillNumbers = existingPurchase ? [req.body.billNum] : [];

  let data = await purchaseBodyValidation(req.body, existingBillNumbers);
  if (data.error) throw new Error(data.error, 400);

  let {
    items,
    supplier,
    billNum,
    billDate,
    taxableAmount,
    gstAmount,
    attachment,
  } = data;

  // Calculate and validate totals
  let newTaxableAmount = 0,
    newGstAmount = 0,
    newGrandTotal = 0;
  let gstBreakdown = { gst5: 0, gst12: 0, gst18: 0, gst28: 0 };

  for (const item of items) {
    let product = await models.Product.findById(item.product).lean();
    if (product?.cost != item.rate)
      throw new Error(`Rate mismatch for Product - "${product?.name}"`, 400);

    const itemTotalAmount = item.quantity * product.cost;
    if (item.amount != parseFloat(itemTotalAmount.toFixed(2))) {
      throw new Error(`Amount mismatch for Product - '${product?.name}'`, 400);
    }

    const itemTaxableAmount = item.quantity * product.specialPrice;
    newTaxableAmount += itemTaxableAmount;

    if (item.gst == 5) gstBreakdown.gst5 += itemTaxableAmount;
    else if (item.gst == 12) gstBreakdown.gst12 += itemTaxableAmount;
    else if (item.gst == 18) gstBreakdown.gst18 += itemTaxableAmount;
    else if (item.gst == 28) gstBreakdown.gst28 += itemTaxableAmount;
  }

  // Calculate GST amounts
  let gst5Amount =
    gstBreakdown.gst5 > 0
      ? Number(((gstBreakdown.gst5 * 5) / 100).toFixed(2))
      : 0;
  let gst12Amount =
    gstBreakdown.gst12 > 0
      ? Number(((gstBreakdown.gst12 * 12) / 100).toFixed(2))
      : 0;
  let gst18Amount =
    gstBreakdown.gst18 > 0
      ? Number(((gstBreakdown.gst18 * 18) / 100).toFixed(2))
      : 0;
  let gst28Amount =
    gstBreakdown.gst28 > 0
      ? Number(((gstBreakdown.gst28 * 28) / 100).toFixed(2))
      : 0;

  newGstAmount = gst5Amount + gst12Amount + gst18Amount + gst28Amount;
  newGrandTotal = newTaxableAmount + newGstAmount;

  newTaxableAmount = Number(newTaxableAmount.toFixed(2));
  newGstAmount = Number(newGstAmount.toFixed(2));
  newGrandTotal = Number(newGrandTotal.toFixed(2));

  // Validate calculations
  if (Math.abs(taxableAmount - newTaxableAmount) > 0.01) {
    throw new Error(
      `Taxable amount mismatch. Expected: ${newTaxableAmount}, Received: ${taxableAmount}`,
      400,
    );
  }
  if (Math.abs(gstAmount - newGstAmount) > 0.01) {
    throw new Error(
      `GST amount mismatch. Expected: ${newGstAmount}, Received: ${gstAmount}`,
      400,
    );
  }

  // Generate unique ID
  const counter = new Counter({ counterId: COLLECTIONS.PRODUCT });
  const uniqueId = await counter.uniqueId({
    prefix: "PR",
    identifier: moment().format("MMYY"),
  });

  const purchasePayload = {
    uniqueId,
    supplier,
    billNum,
    billDate,
    totalAmount: newTaxableAmount,
    taxableAmount: newTaxableAmount,
    grandTotal: newGrandTotal,
    gstAmount: newGstAmount,
    items,
    attachment,
    addedBy: req.user._id,
  };

  const purchase = await models.Purchase.create(purchasePayload);

  if (!purchase) throw new Error("Unable to add purchase", 400);

  userActivity({
    req,
    action: ACTIVITY_ACTIONS.INVENTORY.ITEM_ADDED,
    description: `Purchase ${uniqueId} added by {userName}`,
  });

  return new Response("Purchase added successfully", null, 200);
});

// List all purchases
export const listPurchases = asyncErrorHandler(async (req) => {
  let { search, supplier, from, to } = req.query;
  let { skip, limit } = paginationValues(req.query);
  let condition = { status: { $ne: 1 } }; // Exclude deleted

  if (search) {
    search = querySearchSanitize(search);
    const suppliers = await models.Supplier.find({
      company: { $regex: search, $options: "i" },
    }).distinct("_id");

    condition.$or = [
      { uniqueId: { $regex: `${search}`, $options: "i" } },
      { billNum: { $regex: `${search}`, $options: "i" } },
      ...(suppliers.length > 0 ? [{ supplier: { $in: suppliers } }] : []),
    ];
  }

  if (supplier) condition.supplier = supplier;
  if (from) condition.date = { $gte: from };
  if (to) condition.date = { ...condition.date, $lte: to };

  let count = await models.Purchase.countDocuments(condition);
  let data = await models.Purchase.find(condition, {
    billDate: 1,
    billNum: 1,
    uniqueId: 1,
    date: 1,
    taxableAmount: 1,
    gstAmount: 1,
    grandTotal: 1,
  })
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit)
    .populate("supplier", "name uniqueId")
    .populate("addedBy", { name: CONCAT_NAME });

  return new Response(null, { count, data }, 200);
});

// Get purchase details
export const getPurchaseDetails = asyncErrorHandler(async (req) => {
  let { id } = req.query;
  if (!id) throw new Error("Purchase not found", 400);

  let condition = { _id: id, status: { $ne: 1 } };

  let data = await models.Purchase.findOne(
    condition,
    "billDate billNum taxableAmount totalAmount gstAmount grandTotal items gst attachment date time uniqueId",
  )
    .populate({
      path: "supplier",
      select: "name uniqueId address mobile gstIn state",
      populate: {
        path: "state",
        select: "name",
      },
    })
    .populate({
      path: "items.product",
      select: "name",
    })
    .populate("addedBy", "firstName lastName");

  return new Response(null, { data }, 200);
});

// Supplier filter options for listing
export const supplierFilterOptions = asyncErrorHandler(async (req) => {
  let data = await models.Purchase.aggregate([
    { $match: { status: { $ne: 1 } } },
    { $group: { _id: "$supplier" } },
    {
      $lookup: {
        from: COLLECTIONS.SUPPLIER,
        localField: "_id",
        foreignField: "_id",
        as: "supplier",
      },
    },
    {
      $project: {
        _id: 1,
        label: { $arrayElemAt: ["$supplier.name", 0] },
        value: { $arrayElemAt: ["$supplier._id", 0] },
        uniqueId: { $arrayElemAt: ["$supplier.uniqueId", 0] },
      },
    },
  ]);

  return new Response(null, { data }, 200);
});

// Update purchase
export const updatePurchase = asyncErrorHandler(async (req) => {
  if (!req.isAdmin) {
    throw new Error("You are not authorized to update purchase", 400);
  }

  let { id } = req.query;
  if (!id) throw new Error("Purchase not found", 400);

  let condition = { _id: id, status: { $ne: 1 } };
  let purchase = await models.Purchase.findOne(condition);

  if (!purchase) throw new Error("Purchase not found", 400);

  let data = await purchaseBodyValidation(req.body);
  if (data.error) throw new Error(data.error, 400);

  let {
    items,
    supplier,
    billNum,
    billDate,
    taxableAmount,
    gstAmount,
    attachment,
  } = data;

  // Calculate and validate totals (same logic as addPurchase)
  let newTaxableAmount = 0,
    newGstAmount = 0,
    newGrandTotal = 0;
  let gstBreakdown = { gst5: 0, gst12: 0, gst18: 0, gst28: 0 };

  for (const item of items) {
    const matchedItem = purchase.items.find(
      (obj) => obj.product.toString() === item.product.toString(),
    );

    let product, productName, itemTaxableAmount;

    if (matchedItem) {
      product = matchedItem;
      productName = "Product"; // You might want to fetch actual name

      if (product?.rate != item.rate)
        throw new Error(`Rate mismatch for Product - "${productName}"`, 400);

      const itemTotalAmount = item.quantity * product.rate;
      itemTaxableAmount = item.quantity * product.price;

      if (item.amount != parseFloat(itemTotalAmount.toFixed(2))) {
        throw new Error(`Amount mismatch for Product - '${productName}'`, 400);
      }
    } else {
      product = await models.Product.findById(item.product).lean();
      productName = product?.name || "Unknown Product";

      if (product?.cost != item.rate)
        throw new Error(`Rate mismatch for Product - "${productName}"`, 400);

      const itemTotalAmount = item.quantity * product.cost;
      itemTaxableAmount = item.quantity * product.specialPrice;

      if (item.amount != parseFloat(itemTotalAmount.toFixed(2))) {
        throw new Error(`Amount mismatch for Product - '${productName}'`, 400);
      }
    }

    newTaxableAmount += itemTaxableAmount;

    if (item.gst == 5) gstBreakdown.gst5 += itemTaxableAmount;
    else if (item.gst == 12) gstBreakdown.gst12 += itemTaxableAmount;
    else if (item.gst == 18) gstBreakdown.gst18 += itemTaxableAmount;
    else if (item.gst == 28) gstBreakdown.gst28 += itemTaxableAmount;
  }

  let gst5Amount =
    gstBreakdown.gst5 > 0
      ? Number(((gstBreakdown.gst5 * 5) / 100).toFixed(2))
      : 0;
  let gst12Amount =
    gstBreakdown.gst12 > 0
      ? Number(((gstBreakdown.gst12 * 12) / 100).toFixed(2))
      : 0;
  let gst18Amount =
    gstBreakdown.gst18 > 0
      ? Number(((gstBreakdown.gst18 * 18) / 100).toFixed(2))
      : 0;
  let gst28Amount =
    gstBreakdown.gst28 > 0
      ? Number(((gstBreakdown.gst28 * 28) / 100).toFixed(2))
      : 0;

  newGstAmount = gst5Amount + gst12Amount + gst18Amount + gst28Amount;
  newGrandTotal = newTaxableAmount + newGstAmount;

  newTaxableAmount = Number(newTaxableAmount.toFixed(2));
  newGstAmount = Number(newGstAmount.toFixed(2));
  newGrandTotal = Number(newGrandTotal.toFixed(2));

  // Validate calculations
  if (Math.abs(taxableAmount - newTaxableAmount) > 0.01) {
    throw new Error(
      `Taxable amount mismatch. Expected: ${newTaxableAmount}, Received: ${taxableAmount}`,
      400,
    );
  }
  if (Math.abs(gstAmount - newGstAmount) > 0.01) {
    throw new Error(
      `GST amount mismatch. Expected: ${newGstAmount}, Received: ${gstAmount}`,
      400,
    );
  }

  let update = {
    supplier,
    billNum,
    billDate,
    totalAmount: newTaxableAmount,
    taxableAmount: newTaxableAmount,
    grandTotal: newGrandTotal,
    gstAmount: newGstAmount,
    items,
    attachment,
    updatedBy: req.user._id,
    upDate: getTimeParam("date"),
    upTime: getTimeParam("timeWithSecond"),
  };

  let updated = await models.Purchase.findOneAndUpdate({ _id: id }, update);
  if (!updated) throw new Error("Failed to update purchase", 400);

  userActivity({
    req,
    action: ACTIVITY_ACTIONS.INVENTORY.ITEM_UPDATED,
    description: `Purchase ${purchase.uniqueId} updated by {userName}`,
  });

  return new Response("Purchase updated successfully", null, 200);
});

// Delete purchase
export const deletePurchase = asyncErrorHandler(async (req) => {
  let { id } = req.query;
  if (!id) throw new Error("Purchase not found", 400);

  let condition = { _id: id, status: { $ne: 1 } };
  let purchase = await models.Purchase.findOne(condition);

  if (!purchase) throw new Error("Purchase not found", 400);

  let update = {
    status: 1, // Mark as deleted
    updatedBy: req.user._id,
    upDate: getTimeParam("date"),
    upTime: getTimeParam("timeWithSecond"),
  };

  await models.Purchase.findByIdAndUpdate(id, update);

  userActivity({
    req,
    action: ACTIVITY_ACTIONS.INVENTORY.ITEM_DELETED,
    description: `Purchase ${purchase.uniqueId} deleted by {userName}`,
  });

  return new Response("Purchase deleted successfully", null, 200);
});

// Generate and render PDF
export const purchaseRender = asyncErrorHandler(async (req, res) => {
  let { id } = req.query;
  if (!id) throw new Error("Purchase not found", 400);

  let condition = { _id: id, status: 0 };

  let data = await models.Purchase.aggregate([
    { $match: condition },
    { $unwind: "$items" },
    {
      $lookup: {
        from: COLLECTIONS.PRODUCT,
        localField: "items.product",
        foreignField: "_id",
        as: "product",
      },
    },
    {
      $lookup: {
        from: COLLECTIONS.SUPPLIER,
        localField: "supplier",
        foreignField: "_id",
        as: "supplier",
      },
    },
    {
      $group: {
        _id: "$_id",
        date: { $first: "$date" },
        requestId: { $first: "$uniqueId" },
        invoiceId: { $first: "$invoiceId" },
        totalAmount: { $first: "$totalAmount" },
        taxableAmount: { $first: "$taxableAmount" },
        grandTotal: { $first: "$grandTotal" },
        gstAmount: { $first: "$gstAmount" },
        billNum: { $first: "$billNum" },
        supplier: { $first: "$supplier" },
        items: {
          $push: {
            product: "$items.product",
            name: { $arrayElemAt: ["$product.name", 0] },
            quantity: "$items.quantity",
            unit: {
              $switch: {
                branches: [
                  { case: { $eq: ["$items.unit", 1] }, then: "Litre" },
                  { case: { $eq: ["$items.unit", 2] }, then: "Box" },
                  { case: { $eq: ["$items.unit", 3] }, then: "Number" },
                  { case: { $eq: ["$items.unit", 4] }, then: "Unit" },
                  { case: { $eq: ["$items.unit", 5] }, then: "Packet" },
                ],
                default: { $arrayElemAt: ["$product.secondaryUnit", 0] },
              },
            },
            mrp: "$items.mrp",
            rate: "$items.rate",
            gst: "$items.gst",
            amount: "$items.amount",
          },
        },
      },
    },
  ]);

  if (data.length == 0) throw new Error("Purchase not found", 400);

  data[0].date = moment(data[0].date).format("DD-MM-YYYY");
  let invoice = { data: data[0] };

  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: ["--no-sandbox", "--disable-setuid-sandbox"],
    });

    const templatePath = path.join(__dirname, "../templates/", "purchase.ejs");
    const template = fs.readFileSync(templatePath, "utf-8");
    const compiledTemplate = ejs.compile(template, {
      filename: templatePath,
    });
    const html = compiledTemplate(invoice);
    const page = await browser.newPage();

    await page.setContent(html, { waitUntil: "networkidle0" });

    const pdfBuffer = await page.pdf({
      format: "A4",
      landscape: false,
      displayHeaderFooter: true,
      printBackground: true,
      preferCSSPageSize: true,
      footerTemplate: `<div style="font-size:10px;text-align:center;width:100%;margin-top:10px;">
        Page <span class="pageNumber"></span> of <span class="totalPages"></span>
      </div>`,
    });

    await browser.close();

    res.set({
      "Content-Type": "application/pdf",
      "Content-Disposition": 'inline; filename="purchase.pdf"',
      "Content-Length": pdfBuffer.length,
    });

    res.end(pdfBuffer);
  } catch (error) {
    console.log(error);
    throw new Error(error.message, 400);
  }
});
