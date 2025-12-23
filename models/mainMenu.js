import mongoose from "mongoose";

let Schema = mongoose.Schema;
import COLLECTIONS from "@/config/collections.js";
import getTimeParam from "@/utils/getTimeParam.js";

let schema = new Schema(
  {
    ip: {
      type: String,
    },
    path: String,
    date: {
      type: String,
      default: () => getTimeParam("date"),
    },
    time: {
      type: String,
      default: () => getTimeParam("timeWithSecond"),
    },
    status: {
      type: Number,
      default: 0,
    },
    department: {
      type: Number,
    },
    name: {
      type: String,
    },
    link: {
      type: String,
    },
    icon: {
      type: String,
    },
    order: {
      type: Number,
    },
    divider: Boolean,
    group: Number,
    titleMenu: Boolean,
    masterPath: {
      type: Boolean,
      default: false,
    },
    module: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.MODULES,
    },
    domains: [String],
  },
  { timestamps: true, collection: COLLECTIONS.MAIN_MENUS }
);

let mainMenu = mongoose.model(COLLECTIONS.MAIN_MENUS, schema);

export default mainMenu;
