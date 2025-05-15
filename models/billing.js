import { Schema, model } from "mongoose";
import { COLLECTIONS } from "../config.js";
import moment from "moment";

const schema = new Schema(
  {
    uniqueId: { type: String, unique: true }, // uuid v7 id
    billId: { type: String }, // counter unique id
    visitId: { type: String }, // counter unique id for bar code
    branch: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BRANCH },
    subBranch: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BRANCH },
    franchise: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BRANCH },
    branchType: { type: Number, enum: [1, 2, 3], default: 1 }, // 1- Main, 2- Sub, 3- Franchise,

    patient: { type: Schema.Types.ObjectId, ref: COLLECTIONS.CUSTOMER },
    doctor: { type: Schema.Types.ObjectId, ref: COLLECTIONS.DOCTORS },
    corporate: { type: Schema.Types.ObjectId, ref: COLLECTIONS.CORPORATE },
    hospital: { type: Schema.Types.ObjectId, ref: COLLECTIONS.HOSPITAL },
    tests: [{ type: Schema.Types.ObjectId, ref: COLLECTIONS.TEST }],
    result: { type: Boolean, default: 2, enum: [1, 2] }, // 1: Published, 2: Processing
    status: { type: Number, default: 0, enum: [0, 1] }, // 0: active, 1: delete
    paymentMode: [
      {
        mode: { type: Number, enum: [1, 2, 3, 4, 5] },
        value: Number,
        name: String,
      },
    ],
    total: Number,
    receivedAmount: Number,
    totalDiscount: Number,
    adjAmount: Number,
    grandTotal: Number,
    opNumber: Number,
    ipNumber: Number,
    discount: Number,
    offerCodeStatus: { type: Boolean, default: false },
    offerDiscountInfo: {
      offerCode: { type: Schema.Types.ObjectId, ref: COLLECTIONS.OFFER_CODE },
      type: { type: Number, enum: [0, 1] }, // 0: percentage, 1: fixed
      status: { type: Number, enum: [1, 2, 3, 4] }, // 1: approved, 2: rejected, 3: pending, 4: expired
      amountOrPercentage: Number,
      maxLimit: Number,
      code: String,
      name: String,
      allotedAmount: Number,
      availedAmount: Number,
    },
    offercode: String,
    discountAmount: Number,
    offerDiscount: Number,

    date: { type: String, default: () => moment().format("YYYY-MM-DD") },
    time: { type: String, default: () => moment().format("HH:mm:ss") },
    addedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
    updatedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
  },
  { timestamps: true, collection: COLLECTIONS.BILLING }
);

export default model(COLLECTIONS.BILLING, schema);
