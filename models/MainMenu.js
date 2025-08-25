import mongoose from "mongoose";
let Schema = mongoose.Schema;
import { COLLECTIONS } from "../config.js";
import moment from "moment";

let menuSchema = new Schema(
  {
    ip: {
      type: String,
    },
    path: String,
    date: {
      type: String,
      default: () => moment().format("YYYY-MM-DD"),
    },
    time: {
      type: String,
      default: () => moment().format("HH:mm:ss"),
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
  },
  { timestamps: true, collection: COLLECTIONS.MAIN_MENUS }
);

let MainMenu = mongoose.model(COLLECTIONS.MAIN_MENUS, menuSchema);

export default MainMenu;
