import moment from "moment";
import { Schema, model } from "mongoose";
import { COLLECTIONS } from "../config.js";

const OfferCodeSchema = new Schema(
  {
    ip: String,
    status: { type: Number, default: 2, enum: [0, 1, 2] }, //? 0 = active, 1 = deleted , 2 = inactive
    type: { type: Number, enum: [0, 1] }, //? 0= percentage . 1 = flat amount amount
    amountOrPercentage: Number,

    code: { type: String, required: true },
    name: { type: String, required: true },

    maxLimit: Number,
    allotedAmount: Number,
    availedAmount: { type: Number, default: 0 },
    availedCount: { type: Number, default: 0 },
    used: [{ type: Schema.Types.ObjectId, ref: COLLECTIONS.CUSTOMER }],

    validFrom: String,
    validTo: String,
    remarks: String,

    addedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
    updatedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
    date: { type: String, default: () => moment().format("YYYY-MM-DD") },
    time: { type: String, default: () => moment().format("HH:mm:ss") },
    upDate: String,
    upTime: String,
  },
  { timestamps: true, collection: COLLECTIONS.OFFER_CODE }
);

const OfferCode = model(COLLECTIONS.OFFER_CODE, OfferCodeSchema);

export default OfferCode;