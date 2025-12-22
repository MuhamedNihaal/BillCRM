import mongoose from "mongoose";

let Schema = mongoose.Schema;
import * as security from "@/config/security.js";
import COLLECTIONS from "@/config/collections.js";
import commonFields from "@/utils/commonFields.js";

const schema = new Schema(
  {
    status: { type: Number, default: 0, description: "0 - active, 1 - deleted" },
    name: { type: String, trim: true },
    uniqueId: { type: String, trim: true },
    mobile: { type: String, trim: true },
    email: { type: String, trim: true },
    contactPerson: { type: String, trim: true },
    designation: { type: String, trim: true },
    address: { type: String, trim: true },
    type: {
      type: Number,
      enum: [0, 1],
      default: 1,
      description: "0 - franchise, 1 - company owned",
    },

    company: { type: Schema.Types.ObjectId, ref: COLLECTIONS.COMPANY, default: security.COMPANY },
    mainBranch: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BRANCH, default: security.MAIN_BRANCH },

    officeAccount: { type: Schema.Types.ObjectId, ref: COLLECTIONS.CHART_OF_ACCOUNT },
    billAccount: { type: Schema.Types.ObjectId, ref: COLLECTIONS.CHART_OF_ACCOUNT },

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
  { timestamps: true, collection: COLLECTIONS.COLLECTION_CENTER }
);

const index = mongoose.model(COLLECTIONS.COLLECTION_CENTER, schema);
export default index;
