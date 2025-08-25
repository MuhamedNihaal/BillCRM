import mongoose from "mongoose";
import { COLLECTIONS } from "../config.js";
let Schema = mongoose.Schema;
import moment from "moment";

let privilegeSchema = new Schema(
  {
    status: {
      type: Number,
      default: 0,
    },
    name: {
      type: String,
      required: true,
    },
    code: {
      type: String,
      required: true,
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.USERS,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.USERS,
    },
    alloted_main_menus: [
      {
        _id: false,
        id: {
          type: Schema.Types.ObjectId,
          ref: COLLECTIONS.MAIN_MENUS,
        },
        module: {
          type: Schema.Types.ObjectId,
          ref: COLLECTIONS.MODULES,
        },
        create: { type: Boolean },
        view: { type: Boolean },
        edit: { type: Boolean },
        remv: { type: Boolean },
      },
    ],
    alloted_submenus: [
      {
        _id: false,
        id: {
          type: Schema.Types.ObjectId,
          ref: COLLECTIONS.SUB_MENUS,
        },
        mainMenu: {
          type: Schema.Types.ObjectId,
          ref: COLLECTIONS.MAIN_MENUS,
        },
        create: { type: Boolean },
        view: { type: Boolean },
        edit: { type: Boolean },
        remv: { type: Boolean },
      },
    ],
    alloted_companies: [
      {
        type: Schema.Types.ObjectId,
        ref: "company",
      },
    ],
    alloted_local_bodies: [
      {
        type: Schema.Types.ObjectId,
        ref: "local_body_name",
      },
    ],
    alloted_app_menus: [
      {
        type: Schema.Types.ObjectId,
        ref: "android_menu",
      },
    ],
    alloted_app_submenus: [
      {
        type: Schema.Types.ObjectId,
        ref: "android_submenu",
      },
    ],
    alloted_branches: [
      {
        type: Schema.Types.ObjectId,
        ref: "newBranch",
      },
    ],
    alloted_modules: [
      {
        _id: false,
        id: {
          type: Schema.Types.ObjectId,
          ref: COLLECTIONS.MODULES,
        },
        status: Boolean,
      },
    ],
    superAdmin: { type: Boolean, default: false },
    parent: { type: Schema.Types.ObjectId, ref: COLLECTIONS.PRIVILEGES },

    date: { type: String, default: () => moment().format("YYYY-MM-DD") },
    time: { type: String, default: () => moment().format("HH:mm:ss") },
  },
  { timestamps: true, collection: COLLECTIONS.PRIVILEGES }
);

let Privilege = mongoose.model(COLLECTIONS.PRIVILEGES, privilegeSchema);

export default Privilege;
