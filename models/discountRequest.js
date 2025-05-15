import { Schema, model } from "mongoose";
import { COLLECTIONS } from "../config.js";
import moment from "moment";

const schema = new Schema(
  {
    uniqueId: { type: String },

    patient: { type: Schema.Types.ObjectId, ref: COLLECTIONS.CUSTOMER },
    bill: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BILLING },

    total: Number,
    offerCodeStatus: Boolean,
    offerCode: { type: Schema.Types.ObjectId, ref: COLLECTIONS.OFFER_CODE },
    discount: Number,
    adjAmount: Number,
    grandTotal: Number,
    key: String,

    status: { type: Number, enum: [1, 2, 3, 4], default: 3 }, // 1- approved, 2 - rejected, 3 - pending, 4 - expire

    discountHandler: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
    date: { type: String, default: () => moment().format("YYYY-MM-DD") },
    time: { type: String, default: () => moment().format("HH:mm:ss") },
    addedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
    updatedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
  },
  { timestamps: true, collection: COLLECTIONS.DISCOUNT_REQUEST }
);

export default model(COLLECTIONS.DISCOUNT_REQUEST, schema);
