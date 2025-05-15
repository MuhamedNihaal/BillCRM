import moment from "moment";
import models from "../models/index.js";
import { asyncErrorHandler, Error, Response } from "express-error-catcher";
import { getDate, getTime, paginationValues, userActivity } from "../helper/functions.js";
import { COLLECTIONS } from "../config.js";
import Counter from "../helper/counter.js";
import { purchaseBodyValidation } from "../utils/validation.yup.js";


export const supplierOptions = asyncErrorHandler(async (req) => {
  let { search } = req.query;
  let condition = { status: 0 }
  if (search) {
    condition.$or = [
      { name: { $regex: `${search}`, $options: "i" } },
      { company: { $regex: `${search}`, $options: "i" } },
      { uniqueId: { $regex: `${search}`, $options: "i" } },
      { mobile: { $regex: `${search}`, $options: "i" } },
      { email: { $regex: `${search}`, $options: "i" } },
    ]
  }

  let data = await models.Supplier.find(
    condition,
    {
      label: "$name",
      value: "$_id",
      name: 1,
      address: 1,
      uniqueId: 1,
      mobile: 1,
      gstIn: 1
    }
  ).populate("state", "name").sort({ name: 1 });

  return new Response(null, { data }, 200);
})


export const productOptions = asyncErrorHandler(async (req) => {
  let { search } = req.query;
  let condition = { status: 0 }
  if (search) {
    condition.$or = [
      { name: { $regex: `${search}`, $options: "i" } },
      { sku: { $regex: `${search}`, $options: "i" } },
    ]
  }

  let data = await models.Product.find(
    condition,
    {
      label: "$name",
      value: "$_id",
      name: 1,
      sku: 1,
      primaryUnit: 1,
      mrp: 1,
      rate: "$cost",
      gst: 1,
    }
  ).sort({ name: 1 });

  return new Response(null, { data }, 200);
})


export const addPurchase = asyncErrorHandler(async (req) => {

  let data = await purchaseBodyValidation(req.body);
  if (data.error) throw new Error(data.error, 400);
  let { items, supplier, billNum, billDate, totalAmount, taxableAmount, grandTotal, gst, gstAmount, attachment } = data;

  let newTotalAmount = 0, newTaxableAmount = 0, newGrandTotal = 0, newGstAmount = 0;
  let gst5 = 0, gst12 = 0, gst18 = 0, gst28 = 0;
  for (const item of items) {
    let product = await models.Product.findById(item.product).lean();
    if (product?.cost != item.rate) throw new Error(`Rate mismatch for Product - "${product?.name}"`, 400);
    if (item.amount != (item.quantity * product.cost).toFixed(2)) throw new Error(`Amount mismatch for Product - '${product?.name}'`, 400);
    newGrandTotal += Number((item.quantity * product.cost).toFixed(2))
    console.log("newGrandTotal",newGrandTotal)

    if (item.gst == 5) gst5 += Number((item.quantity * product.cost).toFixed(2))
    else if (item.gst == 12) gst12 += Number((item.quantity * product.cost).toFixed(2))
    else if (item.gst == 18) gst18 += Number((item.quantity * product.cost).toFixed(2))
    else if (item.gst == 28) gst28 += Number((item.quantity * product.cost).toFixed(2));
  }

  console.log("gst5 gst12 gst18 gst28",gst5,gst12,gst18,gst28)
  if (gst5 > 0) gst5 = Number((gst5 * 5 / 100).toFixed(2));
  if (gst12 > 0) gst12 = Number((gst12 * 12 / 100).toFixed(2));
  if (gst18 > 0) gst18 = Number((gst18 * 18 / 100).toFixed(2));
  if (gst28 > 0) gst28 = Number((gst28 * 28 / 100).toFixed(2));

    console.log("gst5 gst12 gst18 gst28",gst5,gst12,gst18,gst28)

  newGstAmount = gst5 + gst12 + gst18 + gst28;

  newTotalAmount = Number((newGrandTotal - newGstAmount).toFixed(2));
  
  newGrandTotal = Number(newGrandTotal.toFixed(2));


  console.log("GST Amount", newGstAmount);
  console.log("newTotalAmount", newTotalAmount);
  console.log("newGrandTotal", newGrandTotal);

  if (totalAmount != newTotalAmount) throw new Error(`Total amount mismatch`, 400);
  if (grandTotal != newGrandTotal) throw new Error(`Grand Total mismatch`, 400);


  const counter = new Counter("Purchase");
  const uniqueId = await counter.uniqueId("PR", moment().format("MMYY"))
  await counter.save();

  let purchase = await models.Purchase({
    uniqueId,
    supplier,
    billNum,
    billDate,
    totalAmount: newTotalAmount,
    taxableAmount: newTotalAmount,
    grandTotal: newGrandTotal,
    gst,
    gstAmount: newGstAmount,
    items,
    attachment,
    addedBy: req.user._id,
  }).save();

  if (!purchase) throw new Error("Unable to add purchase", 400);
  userActivity(req, "Purchase added", `Purchase ${uniqueId} added by ${req.user.firstName || ""} ${req.user.lastName || ""}`);
  return new Response("Purchase added successfully", null, 200);
})


export const listPurchases = asyncErrorHandler(async (req) => {
  let { search, supplier, from, to, status, paymentStatus } = req.query;
  let { skip, limit } = paginationValues(req.query);
  let condition = { status: { $ne: 1 } };

  if (search) {
    condition.$or = [
      { uniqueId: { $regex: `${search}`, $options: "i" } },
      { billNum: { $regex: `${search}`, $options: "i" } },
    ]
  }
  if (supplier) condition.supplier = supplier;
  if (from) condition.date = { $gte: from };
  if (to) condition.date = { ...condition, $lte: to };
  if (status) {
    if (status != 0 && status != 2) throw new Error("Invalid status", 400);
    condition.status = Number(status);
  }
  if (paymentStatus) condition.paymentStatus = Number(paymentStatus);
  let count = await models.Purchase.countDocuments(condition);
  let data = await models.Purchase.find(condition,
    {
      billDate: 1,
      billNum: 1,
      uniqueId: 1,
      date: 1,
      taxableAmount: 1,
      gstAmount: 1,
      grandTotal: 1,
      editEnabled: 1,
      status: 1,
      paymentStatus: 1,
    }
  )
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit)
    .populate("supplier", "name uniqueId")
    .populate("addedBy", { name: CONCAT_NAME });

  return new Response(null, { count, data }, 200);
})


export const getPurchaseDetails = asyncErrorHandler(async (req) => {
  let { id } = req.query;
  if (isNull(id)) throw new Error("Purchase not found", 400);
  let condition = { _id: id, status: { $ne: 1 } }

  let data = await models.Purchase.findOne(condition,
    "billDate billNum taxableAmount totalAmount gstAmount grandTotal paidAmount items gst attachment date time status paymentStatus uniqueId acceptedDate acceptedTime",
  ).populate({
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
    .populate("addedBy", { name: CONCAT_NAME })
    .populate("acceptedBy", { name: CONCAT_NAME });

  return new Response(null, { data }, 200);
})


// Options for filter (Purchase listing)
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
      }
    },
    {
      $project: {
        _id: 1,
        label: { $arrayElemAt: ["$supplier.name", 0] },
        value: { $arrayElemAt: ["$supplier._id", 0] },
        uniqueId: { $arrayElemAt: ["$supplier.uniqueId", 0] },
      }
    }
  ])

  return new Response(null, { data }, 200);
})


export const acceptedPurchaseList = asyncErrorHandler(async (req) => {
  let condition = { status: { $ne: 1 } };
  let count = await models.PurchaseAcceptedItems.countDocuments(condition);
  let data = await models.PurchaseAcceptedItems.aggregate([
    { $match: { status: { $ne: 1 } } },
    {
      $lookup: {
        from: COLLECTIONS.USERS,
        localField: "addedBy",
        foreignField: "_id",
        as: "addedBy",
      }
    },
    {
      $lookup: {
        from: COLLECTIONS.PRODUCT,
        localField: "item.product",
        foreignField: "_id",
        as: "productDetails",
      }
    },
    {
      $project: {
        _id: 1,
        uniqueId:1,
        date:1,
        addedBy: { $arrayElemAt: ["$addedBy.firstName", 0] },
        item:1,
        productName: {
          $arrayElemAt: ["$productDetails.name", 0]
        },
      }
    }
  ]).sort({ _id: -1 })
  return new Response(null, {count, data }, 200);
})

export const updatePurchase = asyncErrorHandler(async (req) => {
  let { id } = req.query;
  if (isNull(id)) throw new Error("Purchase not found", 400);
  let condition = { _id: id, status: { $ne: 1 } }
  let purchase = await models.Purchase.findOne(condition);
  if (!purchase) throw new Error("Purchase not found", 400);
  if (!purchase.editEnabled) throw new Error("This Purchase is not editable", 400);

  let data = await purchaseBodyValidation(req.body);
  if (data.error) throw new Error(data.error, 400);
  console.log(data);
  let { items, supplier, billNum, billDate, totalAmount, taxableAmount, grandTotal, gst, gstAmount, attachment } = data;

  const productIds = purchase.items.map(i => i.product.toString());
  const productDocs = await models.Product.find({ _id: { $in: productIds } });
  const productsMap = Object.fromEntries(productDocs.map(p => [p._id.toString(), p.name]));
  await validateAcceptedItems(purchase.items, items, productsMap);
  let newTotalAmount = 0, newTaxableAmount = 0, newGrandTotal = 0, newGstAmount = 0;
  let gst5 = 0, gst12 = 0, gst18 = 0, gst28 = 0;

  for (const item of items) {
    const matchedItem = purchase.items.find(
      (obj) => obj.product.toString() === item.product.toString()
    );

    if (matchedItem) {
      let product = matchedItem;
      const productName = productsMap[matchedItem.product] || "Unknown Product";
      if (product?.rate != item.rate) throw new Error(`Rate mismatch for Product - "${productName}"`, 400);
      if (item.amount != (item.quantity * product.rate).toFixed(2)) throw new Error(`Amount mismatch for Product - '${productName}'`, 400);
      newGrandTotal += Number((item.quantity * product.rate).toFixed(2))

      if (item.gst == 5) gst5 += Number((item.quantity * product.rate).toFixed(2))
      else if (item.gst == 12) gst12 += Number((item.quantity * product.rate).toFixed(2))
      else if (item.gst == 18) gst18 += Number((item.quantity * product.rate).toFixed(2))
      else if (item.gst == 28) gst28 += Number((item.quantity * product.rate).toFixed(2));
    } else {
      let product = await models.Product.findById(item.product).lean();
      if (product?.cost != item.rate) throw new Error(`Rate mismatch for Product - "${product?.name}"`, 400);
      if (item.amount != (item.quantity * product.cost).toFixed(2)) throw new Error(`Amount mismatch for Product - '${product?.name}'`, 400);
      newGrandTotal += Number((item.quantity * product.cost).toFixed(2))

      if (item.gst == 5) gst5 += Number((item.quantity * product.cost).toFixed(2))
      else if (item.gst == 12) gst12 += Number((item.quantity * product.cost).toFixed(2))
      else if (item.gst == 18) gst18 += Number((item.quantity * product.cost).toFixed(2))
      else if (item.gst == 28) gst28 += Number((item.quantity * product.cost).toFixed(2));
    }
  }

  if (gst5 > 0) gst5 = Number((gst5 * 5 / 100));
  if (gst12 > 0) gst12 = Number((gst12 * 12 / 100));
  if (gst18 > 0) gst18 = Number((gst18 * 18 / 100));
  if (gst28 > 0) gst28 = Number((gst28 * 28 / 100));

  newGstAmount = gst5 + gst12 + gst18 + gst28;
  newTotalAmount = Number((newGrandTotal - newGstAmount).toFixed(2));
  newGrandTotal = Number(newGrandTotal.toFixed(2));

  console.log("GST Amount", newGstAmount);
  console.log("newTotalAmount", newTotalAmount);
  console.log("newGrandTotal", newGrandTotal);

  if (totalAmount != newTotalAmount) throw new Error(`Total amount mismatch`, 400);
  if (grandTotal != newGrandTotal) throw new Error(`Grand Total mismatch`, 400);

  let update = {
    supplier,
    billNum,
    billDate,
    totalAmount: newTotalAmount,
    taxableAmount: newTotalAmount,
    grandTotal: newGrandTotal,
    gst,
    gstAmount: newGstAmount,
    items,
    attachment,
    updatedBy: req.user._id,
    upDate: getDate(),
    upTime: getTime(),
  }

  let updated = await models.Purchase.findOneAndUpdate({ _id: id }, update);
  if (!updated) throw new Error("Failed to update purchase", 400);
  userActivity(req, "Purchase updated", `Purchase ${purchase.uniqueId} updated by ${req.user.firstName || ""} ${req.user.lastName || ""}`);
  return new Response("Purchase updated successfully", null, 200);
})



const validateAcceptedItems = async (originalItems, updatedItems, productsMap) => {
  for (let origItem of originalItems) {
    if (origItem.status === 0) {
      const matchedItem = updatedItems.find(
        (item) => item.product.toString() === origItem.product.toString()
      );

      if (!matchedItem) {
        const productName = productsMap[origItem.product] || "Unknown Product";
        throw new Error(`Item '${productName}' is already accepted and cannot be removed.`);
      }

      const fieldsToCompare = ["sku", "quantity", "unit", "mrp", "rate", "gst", "amount"];
      for (let field of fieldsToCompare) {
        if (matchedItem[field] !== origItem[field]) {
          throw new Error("Accepted items are not editable.");
        }
      }
    }
  }
};


export const deletePurchase = asyncErrorHandler(async (req) => {
  let { id } = req.query;
  if (isNull(id)) throw new Error("Purchase not found", 400);
  let condition = { _id: id, status: { $ne: 1 } }
  let purchase = await models.Purchase.findOne(condition);
  if (!purchase) throw new Error("Purchase not found", 400);
  if (!purchase.editEnabled) throw new Error("This Purchase is already accepted and cannot be deleted.", 400);

  let update = {
    status: 1,
    updatedBy: req.user._id,
    upDate: getDate(),
    upTime: getTime(),
  }


})


export const purchaseOptionsToAccept = asyncErrorHandler(async (req) => {
  let { search } = req.query;
  let condition = { status: 2 }
  if (search) {
    condition.$or = [
      { uniqueId: { $regex: `${search}`, $options: "i" } },
    ]
  }
  let data = await models.Purchase.find(
    condition,
    {
      label: "$uniqueId",
      value: "$_id",
      items: 1,
    }
  ).populate("supplier", "name company email mobile")
  .populate({
    path: "items.product",
    select: "name sku", 
  })
  .sort({ _id: -1 });
  return new Response(null, { data }, 200);

})


export const acceptSingleItem = asyncErrorHandler(async (req) => {
  let { purchase, id } = req.body;
  if (isNull(purchase)) throw new Error("Purchase not found", 400);
  if (isNull(id)) throw new Error("Item not found", 400);
  purchase = await models.Purchase.findOne({ _id: purchase, "items._id": id });
  console.log("purchase", purchase);
  if (purchase?.status == 0) throw new Error("This Purchase is already accepted.", 400);
  let item = purchase.items.find(i => i._id?.toString() == id);
  if (!item) throw new Error("Item not found", 400);
  console.log("item", item);
  if (item.status == 0) throw new Error("This Item is already accepted.", 400);

  stockUpdate({ product: item.product, purchase, item, req });
  userActivity(req, "Purchase item accepted", `Purchase (${purchase.uniqueId}) item #${item.sku} accepted by ${req.user.firstName || ""} ${req.user.lastName || ""}`);
  return new Response("Item accepted successfully", null, 200);
})

const stockUpdate = async ({ product, purchase, item, req }) => {
  try {
    let stock = await models.Stock.findOne({ product, status: 0 });
    let preQty = 0
    if (!stock) {
      stock = await models.Stock({
        product,
        totalCost: item.amount,
        currentStock: item.quantity,
        totalStock: item.quantity,
        updatedBy: req.user?._id,
      }).save();
    } else {
      preQty = stock.currentStock;
      stock.totalCost += item.amount;
      stock.currentStock += item.quantity;
      stock.totalStock += item.quantity;
      stock.updatedBy = req.user?._id;
      stock.upDate = getDate();
      stock.upTime = getTime();
      await stock.save();
    }

    if (stock) {
      await models.StockLog({
        type: 0,
        product,
        previousQty: preQty,
        logQty: item.quantity,
        currentQty: stock.currentStock,
        comment: `Item purchased, ${item.quantity} quantity added`,
        addedBy: req.user._id,
        purchase: purchase._id,
        purchaseUniqueId: purchase.uniqueId,
        stock: stock._id,
      }).save();

      await models.PurchaseAcceptedItems({
        purchase: purchase._id,
        uniqueId: purchase.uniqueId,
        supplier: purchase.supplier,

        item: {
          product,
          sku: item.sku,
          quantity: item.quantity,
          unit: item.unit,
          mrp: item.mrp,
          rate: item.rate,
          gst: item.gst,
          amount: item.amount,
        },
        addedBy: req.user._id,
      }).save();

      let update = {
        "items.$.status": 0,
      }

      const notAcceptedItems = purchase.items.filter(item => item.status !== 0);
      if (notAcceptedItems.length === 1) {
        update.status = 0;
        update.acceptedDate = getDate();
        update.acceptedTime = getTime();
        update.acceptedBy = req.user._id;
      }

      await models.Purchase.findOneAndUpdate(
        { _id: purchase._id, "items._id": item._id },
        {
          $set: update
        }
      );
    }
  } catch (error) {
    console.log(error);
  }
}



export const paymentPurchaseList = asyncErrorHandler(async (req) => {
 let { search, supplier, from, to, status, paymentStatus } = req.query;
  let { skip, limit } = paginationValues(req.query);
  let condition = { status: { $ne: 1 },paidStatus:{$ne:1} };

  if (search) {
    condition.$or = [
      { uniqueId: { $regex: `${search}`, $options: "i" } },
      { billNum: { $regex: `${search}`, $options: "i" } },
    ]
  }
  if (supplier) condition.supplier = supplier;
  if (from) condition.date = { $gte: from };
  if (to) condition.date = { ...condition, $lte: to };
  if (status) {
    if (status != 0 && status != 2) throw new Error("Invalid status", 400);
    condition.status = Number(status);
  }
  if (paymentStatus) condition.paymentStatus = Number(paymentStatus);
  let count = await models.Purchase.countDocuments(condition);
  let data = await models.Purchase.find(condition,
    {
      billDate: 1,
      billNum: 1,
      uniqueId: 1,
      date: 1,
      taxableAmount: 1,
      gstAmount: 1,
      grandTotal: 1,
      editEnabled: 1,
      status: 1,
      paymentStatus: 1,
    }
  )
    .sort({ _id: -1 })
    .skip(skip)
    .limit(limit)
    .populate("supplier", "name uniqueId company")
    .populate("addedBy", { name: CONCAT_NAME });

  return new Response(null, { count, data }, 200);
})




export const paymentStatus = asyncErrorHandler(async (req, res) => {
  try {
    const { purchaseIds, amounts } = req.body;

    console.log("Request Body",req.body)

    if (!Array.isArray(purchaseIds) || purchaseIds.length === 0) {
      return res.status(400).json({ message: "No purchase IDs provided" });
    }

    if (!Array.isArray(amounts) || amounts.length !== purchaseIds.length) {
      return res.status(400).json({ message: "Amounts array must match purchase IDs array length" });
    }
    const result = await models.Purchase.updateMany(
      { uniqueId: { $in: purchaseIds } },
      { $set: { paidStatus: 1 } }
    );


    const modifiedCounts = result.modifiedCount;

    if (modifiedCounts > 0) {

      for (let i = 0; i < purchaseIds.length; i++) {
        const purchaseId = purchaseIds[i];
        const amount = amounts[i];
        console.log("purchaseId",purchaseId)
        console.log("amount",amount)

 
        const purchase = await models.Purchase.findOne({ uniqueId: purchaseId }).populate("supplier");
        if (!purchase) {
          console.warn(`Purchase not found for ID: ${purchaseId}`);
          continue;
        }



        console.log("purchase",purchase)

        const supplierUniqueId = purchase.supplier.uniqueId;

        console.log("supplierUniqueId",supplierUniqueId)

        const chartOfAccount = await models.ChartOfAccount.findOne({ uniqueId: supplierUniqueId });
        if (!chartOfAccount) {
          console.warn(`Chart of Account not found for Supplier ID: ${supplierUniqueId}`);
          continue;
        }

   
        const previousBalance = chartOfAccount.balance;
         const newBalance = previousBalance - amount;

        console.log("previousBalance",previousBalance)
        console.log("newBalance",newBalance)



        const chaAacc = await models.ChartOfAccount.updateOne(
          { uniqueId: supplierUniqueId },
          {
            $set: {
              balance: newBalance,
              upDate: moment().format("YYYY-MM-DD"),
              upTime: moment().format("HH:mm:ss"),
            },
          }
        );


        console.log("chaAacc",chaAacc)
     const transaction =   await models.TransactionLog.create({
          type: 2,
          amount,
          uniqueId: supplierUniqueId,
          head: chartOfAccount.head,
          subHead: chartOfAccount.subHead,
          chartOfAccount: chartOfAccount._id,
          previousBalance,
          balance: newBalance,
          referenceNo: purchaseId,
          remarks: "Payment Received",
          company: chartOfAccount.company,
          mainBranch: chartOfAccount.branch,
          collectionCenter: chartOfAccount.collectionCenter,
          date: moment().format("YYYY-MM-DD"),
          time: moment().format("HH:mm:ss"),
          addedBy: req.user._id,
        });

        console.log("transaaction ",transaction)
       const incomeexpense =  await models.IncomeExpense.create({
          type: 2,
          uniqueId: supplierUniqueId,
          subHead: chartOfAccount.subHead,
          fundSource: chartOfAccount._id,
          chartOfAccount: chartOfAccount._id,
          referenceNo: purchaseId,
          amount,
          total: amount,
          remarks:  "Payment Received",
          company: chartOfAccount.company,
          mainBranch: chartOfAccount.branch,
          collectionCenter: chartOfAccount.collectionCenter,
          date: moment().format("YYYY-MM-DD"),
          time: moment().format("HH:mm:ss"),
          addedBy: req.user._id,
        });
      }
    }
     return new Response("Payment status and transactions updated successfully", { modifiedCounts }, 200);
  } catch (error) {
    console.error("Payment status update error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});
