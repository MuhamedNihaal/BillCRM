import mongoose from "mongoose";

let Schema = mongoose.Schema;
import * as security from "@/config/security.js";
import COLLECTIONS from "@/config/collections.js";
import commonFields from "@/utils/commonFields.js";

const schema = new Schema(
  {
    status: { type: Number, default: 0, description: "0 - active, 1 - deleted" },

    name: { type: String, trim: true },
    code: { type: String, trim: true },
    uniqueId: { type: String, trim: true },
    pincode: { type: String, trim: true },
    mobile: { type: String, trim: true },
    landline: { type: String, trim: true },
    email: { type: String, trim: true },
    contactPerson: { type: String, trim: true },
    designation: { type: String, trim: true },
    address: { type: String, trim: true },
    website: { type: String, trim: true },

    type: {
      type: Number,
      enum: [1, 2],
      default: 2,
      description: "1 - Main, 2 - Sub",
    },

    department: {
      type: [{ type: Schema.Types.ObjectId, ref: COLLECTIONS.DEPARTMENT }],
      default: undefined,
    },

    company: { type: Schema.Types.ObjectId, ref: COLLECTIONS.COMPANY, default: security.COMPANY },
    mainBranch: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BRANCH, default: security.MAIN_BRANCH },

    state: { type: Number, ref: COLLECTIONS.STATE },
    district: { type: Schema.Types.ObjectId, ref: COLLECTIONS.DISTRICT },

    latitude: {
      type: Number,
      min: -90,
      max: 90,
    },
    longitude: {
      type: Number,
      min: -180,
      max: 180,
    },

    ...commonFields,
  },
  { timestamps: true, collection: COLLECTIONS.BRANCH }
);

const index = mongoose.model(COLLECTIONS.BRANCH, schema);
export default index;
