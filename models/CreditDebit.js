import { model, Schema } from "mongoose";
import { COLLECTIONS } from "../config.js";
import moment from "moment";

const schema = new Schema(
  {
    fundSource: { type: Schema.Types.ObjectId, ref: COLLECTIONS.CHART_OF_ACCOUNT },

    type: { type: Number }, // 1- Credit, 2- Debit
    amount: { type: Number, required: true },
    balance: { type: Number },

    remarks: { type: String },

    uniqueId: { type: String },
    status: { type: Number, default: 2 }, // 0-Approve 1-Rejected, 2- Pending

    ip: { type: String },
    addedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
    updatedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
    date: { type: String, default: () => moment().format("YYYY-MM-DD") },
    time: { type: String, default: () => moment().format("HH:mm:ss") },
    upDate: String,
    upTime: String,
  },
  { timestamps: true, collection: COLLECTIONS.CREDIT_OR_DEBIT }
);

export default model(COLLECTIONS.CREDIT_OR_DEBIT, schema);
