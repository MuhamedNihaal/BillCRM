import { model, Schema } from "mongoose";
import { COLLECTIONS } from "../config.js";
import moment from "moment";

const schema = new Schema(
  {
    ip: String,
    status: { type: Number, default: 0 },
    type: Number, // 0 - Purchase, 1 - Sale
    product: { type: Schema.Types.ObjectId, ref: COLLECTIONS.PRODUCT },
    purchase: { type: Schema.Types.ObjectId, ref: COLLECTIONS.PURCHASE },
    stock: { type: Schema.Types.ObjectId, ref: COLLECTIONS.STOCK },
    purchaseUniqueId: String,

    previousQty: Number,
    logQty: Number,
    currentQty: Number,

    comment: String,
    date: { type: String, default: () => moment().format("YYYY-MM-DD") },
    time: { type: String, default: () => moment().format("HH:mm:ss") },
    addedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
  },
  { timestamps: true, collection: COLLECTIONS.STOCK_LOG }
);

let StockLog = model(COLLECTIONS.STOCK_LOG, schema);

export default StockLog;
