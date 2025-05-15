import { Schema, model } from "mongoose";
import moment from "moment";
import { COLLECTIONS } from "../config.js";

const schema = new Schema(
  {
    ip: String,
    status: { type: Number, default: 0 }, // 0- Accepted, 1- Deleted
    uniqueId: String,
    purchase: { type: Schema.Types.ObjectId, ref: COLLECTIONS.PURCHASE },

    supplier: { type: Schema.Types.ObjectId, required: true, ref: COLLECTIONS.SUPPLIER },

    item: {
      product: { type: Schema.Types.ObjectId, ref: COLLECTIONS.PRODUCT },
      sku: String,
      quantity: Number,
      unit: Number,
      mrp: Number,
      rate: Number,
      gst: Number,
      amount: Number,
      status: { type: Number, default: 0 }, // 0- Accepted, 1- Pending
    },

    addedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
    updatedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },

    date: { type: String, default: () => moment().format("YYYY-MM-DD") },
    time: { type: String, default: () => moment().format("HH:mm:ss") },
    upDate: { type: String, default: () => moment().format("YYYY-MM-DD") },
    upTime: { type: String, default: () => moment().format("HH:mm:ss") },
  },
  { timestamps: true, collection: COLLECTIONS.PURCHASE_ACCEPTED }
);

const Purchase = model(COLLECTIONS.PURCHASE_ACCEPTED, schema);

export default Purchase;
