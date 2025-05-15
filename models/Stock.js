import { model, Schema } from "mongoose";
import { COLLECTIONS } from "../config.js";
import moment from "moment";

const schema = new Schema(
  {
    status: { type: Number, default: 0, },
    product: { type: Schema.Types.ObjectId, ref: COLLECTIONS.PRODUCT, },

    totalCost: Number,
    currentStock: Number,
    totalStock: Number,

    date: { type: String, default: () => moment().format("YYYY-MM-DD"), },
    time: { type: String, default: () => moment().format("HH:mm:ss"), },
    updatedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USER, },
    upDate: String,
    upTime: String,
  },
  { timestamps: true, collection: COLLECTIONS.STOCK }
);

let Stock = model(COLLECTIONS.STOCK, schema);

export default Stock;
