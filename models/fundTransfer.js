import { model, Schema } from "mongoose";
import { COLLECTIONS } from "../config.js";
import moment from "moment";

const schema = new Schema(
  {
    from: { type: Schema.Types.ObjectId, ref: COLLECTIONS.CHART_OF_ACCOUNT },
    to: { type: Schema.Types.ObjectId, ref: COLLECTIONS.CHART_OF_ACCOUNT },

    amount: { type: Number, required: true },
    balance: { type: Number },
    remarks: { type: String },

    uniqueId: { type: String },

    status: { type: Number, default: 2 }, // 0-Approved 1-Rejected 2-Pending

    ip: { type: String },

    statusUpdate: {
      staff: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
      date: String,
      time: String,
    },

    date: { type: String, default: () => moment().format("YYYY-MM-DD") },
    time: { type: String, default: () => moment().format("HH:mm:ss") },

    upDate: { type: String, default: () => moment().format("YYYY-MM-DD") },
    upTime: { type: String, default: () => moment().format("HH:mm:ss") },

    addedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
    updatedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
  },
  { timestamps: true, collection: COLLECTIONS.FUND_TRANSFER }
);

export default model(COLLECTIONS.FUND_TRANSFER, schema);
