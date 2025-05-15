import moment from "moment";
import { Schema, model } from "mongoose";
import { COLLECTIONS } from "../config.js";

const creditSchema = new Schema({
  fundSource: { type: Schema.Types.ObjectId, ref: COLLECTIONS.CHART_OF_ACCOUNT, required: true },
  amount: { type: Number, required: true },
  due: Number,
  total: Number,
  remarks: String,
  attachment: String,

  date: { type: String, default: () => moment().format("YYYY-MM-DD") },

  addedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
  addedDate: { type: String, default: () => moment().format("YYYY-MM-DD") },
  addedTime: { type: String, default: () => moment().format("HH:mm:ss") },
});

const schema = new Schema(
  {
    head: { type: Number, enum: [1, 2], required: true }, //? 1- Income, 2-Expense
    paymentType: { type: Number, enum: [1, 2], required: true }, //? 1- Credit, 2- Cash
    status: { type: Number, default: 3 }, //0- Approve, 1-Deleted, 2-Rejected, 3-Pending

    creditPayments: [creditSchema],
    amount: { type: Number, required: true },
    received: { type: Number, default: 0 },
    dueDate: { type: String, default: () => moment().format("YYYY-MM-DD") },

    subHead: { type: Schema.Types.ObjectId, ref: COLLECTIONS.ACCOUNT_SUB_HEAD },
    fundSource: { type: Schema.Types.ObjectId, ref: COLLECTIONS.CHART_OF_ACCOUNT },
    chartOfAccount: { type: Schema.Types.ObjectId, ref: COLLECTIONS.CHART_OF_ACCOUNT },

    branchType: {type: Number, enum: [1, 2, 3, 4]}, // 1- Main branch, 2- Sub branch, 3- Franchise, 4- Collection center
    company: { type: Schema.Types.ObjectId, ref: COLLECTIONS.COMPANY },
    mainBranch: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BRANCH },
    subBranch: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BRANCH },
    franchise: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BRANCH },
    collectionCenter: { type: Schema.Types.ObjectId, ref: COLLECTIONS.COLLECTION_CENTER },

    attachment: String,
    remarks: String,

    ip: String,
    date: { type: String, default: () => moment().format("YYYY-MM-DD") },
    time: { type: String, default: () => moment().format("HH:mm:ss") },
    addedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },

    upDate: { type: Date, default: () => moment().format("YYYY-MM-DD") },
    upTime: { type: String, default: () => moment().format("HH:mm:ss") },
    updatedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },

    addedDate: { type: String, default: () => moment().format("YYYY-MM-DD") },
    addedTime: { type: String, default: () => moment().format("HH:mm:ss") },

    statusUpdate: {
      staff: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
      date: String,
      time: String,
    },
  },
  { timestamps: true, collection: COLLECTIONS.CREDITS }
);

export default model(COLLECTIONS.CREDITS, schema);
