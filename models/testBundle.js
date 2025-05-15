import mongoose from "mongoose";
let Schema = mongoose.Schema;
import { COLLECTIONS } from "../config.js";
import moment from "moment";

let schema = new Schema(
  {
    status: { type: Number, default: 0 }, // 0 - active, 1 - delete or inactive

    test: { type: Schema.Types.ObjectId, ref: COLLECTIONS.TEST }, // main test
    testType: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6], // 1 - test, 2 - group, 3 - packages, 4 - culture, 5 - examination, 6 - sub package
    },

    antibioticsStatus: { type: Boolean, default: false },
    antibiotics: { type: Schema.Types.ObjectId, ref: COLLECTIONS.ANTIBIOTICS }, // main test pointed to antibiotic

    sample: { type: Schema.Types.ObjectId, ref: COLLECTIONS.SAMPLE }, // main test pointed to sample
    sampleStatus: { type: Boolean, default: false },

    pointer: { type: Schema.Types.ObjectId, ref: COLLECTIONS.TEST }, // main test pointed to test
    pointerType: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6], // 1 - test, 2 - group, 3 - packages, 4 - culture, 5 - examination, 6 - sub package
    },

    order: { type: Number, default: 1 },

    date: {
      type: String,
      default: moment().format("YYYY-MM-DD"),
    },
    time: {
      type: String,
      default: moment().format("HH:mm:ss"),
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.USERS,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.USERS,
    },
  },
  { timestamps: true, collection: COLLECTIONS.TEST_BUNDLE }
);

let index = mongoose.model(COLLECTIONS.TEST_BUNDLE, schema);

export default index;
