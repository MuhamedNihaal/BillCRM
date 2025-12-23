import mongoose from "mongoose";

let Schema = mongoose.Schema;
import COLLECTIONS from "@/config/collections.js";
import getTimeParam from "@/utils/getTimeParam.js";

let schema = new Schema(
  {
    name: {
      type: String,
    },
    path: String,
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
      default: () => getTimeParam("date"),
    },
    time: {
      type: String,
      default: () => getTimeParam("timeWithSecond"),
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
    masterPath: {
      type: Boolean,
      default: false,
    },
    domains: [String],
  },
  { timestamps: true, collection: COLLECTIONS.MODULES }
);

let modules = mongoose.model(COLLECTIONS.MODULES, schema);

export default modules;
