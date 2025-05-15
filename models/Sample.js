import mongoose from "mongoose";
let Schema = mongoose.Schema;
import { COLLECTIONS } from "../config.js";
import moment from "moment";

let schema = new Schema(
  {
    name: String,
    examination: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.TEST,
    },
    culture: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.TEST,
    },
    type: {
      type: Number,
      default: [1, 2], // 1 - examination, 2 - culture
    },
    data: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.SAMPLE_DATA,
    },
    status: { type: Number, default: 0 },
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
  { timestamps: true, collection: COLLECTIONS.SAMPLE }
);

let index = mongoose.model(COLLECTIONS.SAMPLE, schema);

export default index;
