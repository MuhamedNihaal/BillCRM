import mongoose from "mongoose";
let Schema = mongoose.Schema;
import { COLLECTIONS } from "../config.js";
import moment from "moment";

let schema = new Schema(
  {
    name: { type: String },
    email: { type: String },
    mobile: { type: String },
    location: { type: String },
    district: { type: Schema.Types.ObjectId, ref: COLLECTIONS.DISTRICT },
    state: { type: Schema.Types.Number, ref: COLLECTIONS.STATE },
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
  { timestamps: true, collection: COLLECTIONS.LAB }
);

let index = mongoose.model(COLLECTIONS.LAB, schema);

export default index;
