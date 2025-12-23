import mongoose from "mongoose";

let Schema = mongoose.Schema;
import COLLECTIONS from "@/config/collections.js";
import getTimeParam from "@/utils/getTimeParam.js";

let schema = new Schema(
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
    alloted_main_menus: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: COLLECTIONS.PRIVILEGES_PERMISSION,
        },
      ],
      default: undefined,
    },
    alloted_submenus: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: COLLECTIONS.PRIVILEGES_PERMISSION,
        },
      ],
      default: undefined,
    },
    alloted_companies: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "company",
        },
      ],
      default: undefined,
    },
    alloted_local_bodies: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "local_body_name",
        },
      ],
      default: undefined,
    },
    alloted_app_menus: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "android_menu",
        },
      ],
      default: undefined,
    },
    alloted_app_submenus: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "android_submenu",
        },
      ],
      default: undefined,
    },
    alloted_branches: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: "newBranch",
        },
      ],
      default: undefined,
    },
    alloted_modules: {
      type: [
        {
          type: Schema.Types.ObjectId,
          ref: COLLECTIONS.PRIVILEGES_PERMISSION,
        },
      ],
      default: undefined,
    },
    superAdmin: { type: Boolean, default: false },
    parent: { type: Schema.Types.ObjectId, ref: COLLECTIONS.PRIVILEGES },

    date: { type: String, default: () => getTimeParam("date") },
    time: { type: String, default: () => getTimeParam("timeWithSecond") },
  },
  { timestamps: true, collection: COLLECTIONS.PRIVILEGES }
);

let privilege = mongoose.model(COLLECTIONS.PRIVILEGES, schema);

export default privilege;
