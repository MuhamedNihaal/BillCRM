import mongoose from "mongoose";

let Schema = mongoose.Schema;

import COLLECTIONS from "@/config/collections.js";
import getTimeParam from "@/utils/getTimeParam.js";

let schema = new Schema(
  {
    type: {
      type: Number,
      enum: [1, 2, 3],
      description: "1 - module, 2 - main menu, 3 - sub menus",
      required: true,
    },

    privilege: {
      type: mongoose.Schema.Types.ObjectId,
      ref: COLLECTIONS.PRIVILEGES,
      required: true,
    },

    subMenu: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.SUB_MENUS,
    },

    mainMenu: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.MAIN_MENUS,
    },
    module: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.MODULES,
    },

    enabled: { type: Boolean, default: false },

    create: { type: Boolean, default: false },
    view: { type: Boolean, default: false },
    edit: { type: Boolean, default: false },
    remv: { type: Boolean, default: false },

    date: { type: String, default: () => getTimeParam("date") },
    time: { type: String, default: () => getTimeParam("time") },
  },
  { timestamps: true, collection: COLLECTIONS.PRIVILEGES_PERMISSION }
);

let privilegePermission = mongoose.model(COLLECTIONS.PRIVILEGES_PERMISSION, schema);

export default privilegePermission;
