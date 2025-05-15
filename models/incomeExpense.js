import moment from "moment";
import { Schema, model } from "mongoose";
import { COLLECTIONS } from "../config.js";

const schema = new Schema(
  {
    type: { type: Number, enum: [1, 2], default: 1 }, // 1- Income, 2-Expense
    uniqueId: { type: String, unique: true },

    subHead: { type: Schema.Types.ObjectId, ref: COLLECTIONS.ACCOUNT_SUB_HEAD },
    fundSource: { type: Schema.Types.ObjectId, ref: COLLECTIONS.CHART_OF_ACCOUNT },
    chartOfAccount: { type: Schema.Types.ObjectId, ref: COLLECTIONS.CHART_OF_ACCOUNT },

    fundTransfer: { type: Schema.Types.ObjectId, ref: COLLECTIONS.FUND_TRANSFER },
    credits: { type: Schema.Types.ObjectId, ref: COLLECTIONS.CREDITS },
    payments: { type: Schema.Types.ObjectId, ref: COLLECTIONS.PAYMENTS },
    creditNote: { type: Schema.Types.ObjectId, ref: COLLECTIONS.CREDIT_NOTE },
    creditDebit: { type: Schema.Types.ObjectId, ref: COLLECTIONS.CREDIT_OR_DEBIT },
    referenceNo: { type: String }, // Unique id of Transaction (Payments, Fund Transfer, Credits, Credit Notes)

    bill: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BILLING },

    state: { type: Number, ref: COLLECTIONS.STATE },
    district: { type: Schema.Types.ObjectId, ref: COLLECTIONS.DISTRICT },

    branchType: { type: Number, enum: [1, 2, 3, 4] }, // 1- Main branch, 2- Sub branch, 3- Franchise, 4- Collection center
    company: { type: Schema.Types.ObjectId, ref: COLLECTIONS.COMPANY },
    mainBranch: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BRANCH },
    subBranch: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BRANCH },
    franchise: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BRANCH },
    collectionCenter: { type: Schema.Types.ObjectId, ref: COLLECTIONS.COLLECTION_CENTER },

    amount: Number,
    total: Number,
    remarks: String,

    time: { type: String, default: () => moment().format("HH:mm:ss") },
    date: { type: String, default: () => moment().format("YYYY-MM-DD") },

    ip: String,

    status: { type: Number, default: 0 }, //0-approve 1-rejected
    addedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },

    addedDate: { type: String, default: () => moment().format("YYYY-MM-DD") },
    addedTime: { type: String, default: () => moment().format("HH:mm:ss") },
    addedMonth: { type: String, default: () => moment().format("YYYY-MM") },
  },
  { timestamps: true, collection: COLLECTIONS.INCOME_EXPENSE }
);

export default model(COLLECTIONS.INCOME_EXPENSE, schema);
