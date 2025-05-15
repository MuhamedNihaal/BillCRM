import { Schema, model } from "mongoose";
import { COLLECTIONS } from "../config.js";
import moment from "moment";

const schema = new Schema(
  {
    uniqueId: String,
    patient: { type: Schema.Types.ObjectId, ref: COLLECTIONS.CUSTOMER },
    bill: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BILLING },

    test: { type: Schema.Types.ObjectId, ref: COLLECTIONS.TEST },
    amount: { type: Number, default: 0 },
    reportDate: String,
    reportTime: String,
    status: { type: Number, default: 2 }, // 1: completed, 2: pending, 3: cancelled,
    transferred: { type: Boolean, default: false },
    transferredTo: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BRANCH },

    branch: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.BRANCH,
    },
    subBranch: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BRANCH },
    franchise: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BRANCH },
    branchType: { type: Number, enum: [1, 2, 3], default: 1 }, // 1- Main, 2- Sub, 3- Franchise,

    file: String, // when the test is transferred to another branch the upload a image for close checking

    date: { type: String, default: () => moment().format("YYYY-MM-DD") },
    time: { type: String, default: () => moment().format("HH:mm:ss") },
    addedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
    updatedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
  },
  { timestamps: true, collection: COLLECTIONS.BILLING_TESTS }
);

export default model(COLLECTIONS.BILLING_TESTS, schema);
