import mongoose from "mongoose";
let Schema = mongoose.Schema;
import { COLLECTIONS } from "../config.js";
import moment from "moment";

let submenuSchema = new Schema(
  {
    ip: {
      type: String,
    },
    date: {
      type: String,
      default: moment().format("YYYY-MM-DD"),
    },
    time: {
      type: String,
      default: moment().format("HH:mm:ss"),
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
    order: {
      type: Number,
    },
  },
  { timestamps: true, collection: COLLECTIONS.SUB_MENUS }
);

let SubMenu = mongoose.model(COLLECTIONS.SUB_MENUS, submenuSchema);

export default SubMenu;
