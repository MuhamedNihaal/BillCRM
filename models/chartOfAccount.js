import { Schema, model } from "mongoose";
import { COLLECTIONS } from "../config.js";
import moment from "moment";

const schema = new Schema(
  {
    head: { type: Schema.Types.ObjectId, ref: COLLECTIONS.ACCOUNT_HEAD },
    subHead: { type: Schema.Types.ObjectId, ref: COLLECTIONS.ACCOUNT_SUB_HEAD, required: true },
    company: { type: Schema.Types.ObjectId, ref: COLLECTIONS.COMPANY },
    branch: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BRANCH },
    collectionCenter: { type: Schema.Types.ObjectId, ref: COLLECTIONS.COLLECTION_CENTER },

    name: { type: String, required: true },
    balance: { type: Number, default: 0 },

    uniqueId: { type: String },

    status: { type: Number, default: 0, enum: [0, 1] },

    date: { type: String, default: () => moment().format("YYYY-MM-DD") },
    time: { type: String, default: () => moment().format("HH:mm:ss") },

    upDate: { type: String, default: () => moment().format("YYYY-MM-DD") },
    upTime: { type: String, default: () => moment().format("HH:mm:ss") },

    addedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
    updatedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
  },
  { timestamps: true, collection: COLLECTIONS.CHART_OF_ACCOUNT }
);

export default model(COLLECTIONS.CHART_OF_ACCOUNT, schema);
