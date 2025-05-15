import { model, Schema } from "mongoose";
import moment from "moment";
import { COLLECTIONS } from "../config.js";

const schema = new Schema(
  {
    type: { type: Number, enum: [1, 2] }, // 1- Credit, 2- Debit
    amount: { type: Number },
    uniqueId: { type: String },

    head: { type: Schema.Types.ObjectId, ref: COLLECTIONS.ACCOUNT_HEAD },
    subHead: { type: Schema.Types.ObjectId, ref: COLLECTIONS.ACCOUNT_SUB_HEAD },
    chartOfAccount: { type: Schema.Types.ObjectId, ref: COLLECTIONS.CHART_OF_ACCOUNT },

    previousBalance: { type: Number },
    balance: { type: Number },

    fundTransfer: { type: Schema.Types.ObjectId, ref: COLLECTIONS.FUND_TRANSFER },
    credits: { type: Schema.Types.ObjectId, ref: COLLECTIONS.CREDITS },
    payments: { type: Schema.Types.ObjectId, ref: COLLECTIONS.PAYMENTS },
    creditNote: { type: Schema.Types.ObjectId, ref: COLLECTIONS.CREDIT_NOTE },
    creditDebit: { type: Schema.Types.ObjectId, ref: COLLECTIONS.CREDIT_OR_DEBIT },
    referenceNo: { type: String }, // Unique id of Transaction (Payments, Fund Transfer, Credits, Credit note)
    bill: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BILLING },

    state: { type: Number, ref: COLLECTIONS.STATE },
    district: { type: Schema.Types.ObjectId, ref: COLLECTIONS.DISTRICT },

    branchType: { type: Number, enum: [1, 2, 3, 4] }, // 1- Main branch, 2- Sub branch, 3- Franchise, 4- Collection center
    company: { type: Schema.Types.ObjectId, ref: COLLECTIONS.COMPANY },
    mainBranch: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BRANCH },
    subBranch: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BRANCH },
    franchise: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BRANCH },
    collectionCenter: { type: Schema.Types.ObjectId, ref: COLLECTIONS.COLLECTION_CENTER },

    remarks: { type: String },


    ip: { type: String },
    status: { type: Number, default: 0 },

    date: { type: String, default: () => moment().format("YYYY-MM-DD") },
    time: { type: String, default: () => moment().format("HH:mm:ss") },

    addedDate: { type: String, default: () => moment().format("YYYY-MM-DD") },
    addedTime: { type: String, default: () => moment().format("HH:mm:ss") },
    addedMonth: { type: String, default: () => moment().format("YYYY-MM") },

    addedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
  },
  { timestamps: true, collection: COLLECTIONS.TRANSACTION_LOG }
);

export default model(COLLECTIONS.TRANSACTION_LOG, schema);
