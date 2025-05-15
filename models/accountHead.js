import { Schema, model } from "mongoose";
import moment from "moment";
import { COLLECTIONS } from "../config.js";

const schema = new Schema(
  {
    name: { type: String, required: true },
    status: { type: Number, default: 0, enum: [0, 1] },

    date: { type: String, default: () => moment().format("YYYY-MM-DD") },
    time: { type: String, default: () => moment().format("HH:mm:ss") },

    upDate: { type: String, default: () => moment().format("YYYY-MM-DD") },
    upTime: { type: String, default: () => moment().format("HH:mm:ss") },

    addedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
    updatedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
  },
  { timestamps: true, collection: COLLECTIONS.ACCOUNT_HEAD }
);

export default model(COLLECTIONS.ACCOUNT_HEAD, schema);
