import mongoose from "mongoose";

let Schema = mongoose.Schema;
import * as security from "@/config/security.js";
import COLLECTIONS from "@/config/collections.js";
import commonFields from "@/utils/commonFields.js";

const schema = new Schema(
  {
    status: { type: Number, default: 0, description: "0 - active, 1 - deleted" },

    head: { type: Schema.Types.ObjectId, ref: COLLECTIONS.ACCOUNT_HEAD },
    subHead: { type: Schema.Types.ObjectId, ref: COLLECTIONS.ACCOUNT_SUB_HEAD, required: true },

    company: { type: Schema.Types.ObjectId, ref: COLLECTIONS.COMPANY, default: security.COMPANY },
    branch: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BRANCH, default: security.MAIN_BRANCH },

    collectionCenter: { type: Schema.Types.ObjectId, ref: COLLECTIONS.COLLECTION_CENTER },
    removable: { type: Boolean, default: true },

    name: { type: String, required: true, trim: true },
    balance: { type: Number, default: 0 },
    uniqueId: { type: String, trim: true },

    ...commonFields,
  },
  { timestamps: true, collection: COLLECTIONS.CHART_OF_ACCOUNT }
);

const index = mongoose.model(COLLECTIONS.CHART_OF_ACCOUNT, schema);
export default index;
