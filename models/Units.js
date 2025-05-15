import mongoose from "mongoose";
let Schema = mongoose.Schema;
import { COLLECTIONS } from "../config.js";
import moment from "moment";

let schema = new Schema(
  {
    name: { type: String },
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
  { timestamps: true, collection: COLLECTIONS.UNITS }
);

let index = mongoose.model(COLLECTIONS.UNITS, schema);

export default index;
