import { Schema, model } from "mongoose";
import { COLLECTIONS } from "../config.js";

const schema = new Schema(
  {
    name: String,
    company: String,
    uniqueId: String,

    email: String,
    mobile: String,
    address: String,
    gstIn: String,
    accountNo: String,
    bank: String,
    branch: String,
    state: { type: Number, ref: COLLECTIONS.STATE },

    status: { type: Number, enum: [0, 1, 2], default: 0 },  // 0- Active, 1- Deleted, 2- Inactive

    date: { type: String, default: () => moment().format("YYYY-MM-DD") },
    time: { type: String, default: () => moment().format("HH:mm:ss") },
    upTime: String,
    upDate: String,
    addedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
    updatedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS }
  },
  { timestamps: true, collection: COLLECTIONS.SUPPLIER }
)

export default model(COLLECTIONS.SUPPLIER, schema);