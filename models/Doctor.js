import mongoose from "mongoose";
let Schema = mongoose.Schema;
import { COLLECTIONS } from "../config.js";
import moment from "moment";

let schema = new Schema(
  {
    name: { type: String },
    email: { type: String },
    mobile: { type: String },
    specialization: [{ type: String }],
    hospital: [{ type: Schema.Types.ObjectId, ref: COLLECTIONS.HOSPITAL }],
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
  { timestamps: true, collection: COLLECTIONS.DOCTORS }
);

let index = mongoose.model(COLLECTIONS.DOCTORS, schema);

export default index;
