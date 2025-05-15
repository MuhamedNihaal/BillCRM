import mongoose from "mongoose";
import { COLLECTIONS } from "../config.js";
let Schema = mongoose.Schema;
import moment from "moment";

let modulesSchema = new Schema(
  {
    name: {
      type: String,
    },
    code: {
      type: String,
    },
    order: Number,
    icon: {
      type: String,
    },
    ip: {
      type: String,
    },
    status: {
      type: Number,
      default: 0,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.USERS,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.USERS,
    },
    date: {
      type: String,
      default: moment().format("YYYY-MM-DD"),
    },
    time: {
      type: String,
      default: moment().format("HH:mm:ss"),
    },
    upDate: {
      type: String,
    },
    upTime: {
      type: String,
    },
    redirectUrl: {
      type: String,
    },
  },
  { timestamps: true, collection: COLLECTIONS.MODULES }
);

let modules = mongoose.model(COLLECTIONS.MODULES, modulesSchema);

export default modules;
