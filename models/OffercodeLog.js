import moment from "moment";
import { Schema, model } from "mongoose";
import { COLLECTIONS } from "../config.js";

const OfferCodeLogSchema = new Schema(
  {
    offerCode: { type: Schema.Types.ObjectId, ref: COLLECTIONS.OFFER_CODE },
    status: { type: Number, default: 0, enum: [0, 1] }, //? 0 = applied, 1 = removed ,
    amount: Number,
    uniqueId: String,
    availedAmount: Number,

    couponData: {},

    customer: { type: Schema.Types.ObjectId, ref: COLLECTIONS.CUSTOMER },
    bill: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BILLING },
    branchType: Number,
    branch: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BRANCH },
    collectionCenter: { type: Schema.Types.ObjectId, ref: COLLECTIONS.COLLECTION_CENTER },

    addedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
    date: { type: String, default: () => moment().format("YYYY-MM-DD") },
    time: { type: String, default: () => moment().format("HH:mm:ss") },
  },
  { timestamps: true, collection: COLLECTIONS.OFFER_CODE_LOG }
);

const OfferCodeLog = model(COLLECTIONS.OFFER_CODE_LOG, OfferCodeLogSchema);

export default OfferCodeLog;
