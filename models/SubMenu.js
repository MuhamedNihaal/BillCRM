import mongoose from "mongoose";

let Schema = mongoose.Schema;
import COLLECTIONS from "@/config/collections.js";
import getTimeParam from "@/utils/getTimeParam.js";

let schema = new Schema(
  {
    ip: {
      type: String,
    },
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
    mainMenu: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.MAIN_MENUS,
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
    sub_option_availability: {
      type: String,
    },
    masterPath: {
      type: Boolean,
      default: false,
    },
    path: String,
    order: {
      type: Number,
    },
    domains: [String],
  },
  { timestamps: true, collection: COLLECTIONS.SUB_MENUS }
);

let SubMenu = mongoose.model(COLLECTIONS.SUB_MENUS, schema);

export default SubMenu;
