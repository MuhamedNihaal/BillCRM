import { Schema, model } from "mongoose";
import moment from "moment";
import { COLLECTIONS } from "../config.js";

const schema = new Schema(
  {
    ip: String,
    status: { type: Number, default: 2 }, // 0- Accepted, 1- Deleted, 2- Pending
    paymentStatus: { type: Number, default: 0 }, // 0 - Unpaid, 1 - Partially paid, 2 - Paid
    uniqueId: String,
    billDate: String,
    billNum: String,

    totalAmount: Number,
    taxableAmount: Number,
    gstAmount: Number,
    grandTotal: Number,
    paidAmount: { type: Number, default: 0 },
    paidStatus:{
      type:Number,default:0  //  0 - unpaid 1- paid
    },
    gst: [{
      percentage: Number,
      amount: Number,
      cgstPercentage: Number,
      cgstAmount: Number,
      scgstPercentage: Number,
      scgstAmount: Number,
    }],

    supplier: { type: Schema.Types.ObjectId, required: true, ref: COLLECTIONS.SUPPLIER },

    chartOfAccount: { type: Schema.Types.ObjectId, ref: COLLECTIONS.CHART_OF_ACCOUNT, },
    fundSource: { type: Schema.Types.ObjectId, ref: COLLECTIONS.CHART_OF_ACCOUNT },

    attachment: String,
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: COLLECTIONS.PRODUCT },
        sku: String,
        quantity: Number,
        unit: Number,
        mrp: Number,
        rate: Number,
        gst: Number,
        amount: Number,
        status: { type: Number, default: 1 }, // 0- Accepted, 1- Pending
      },
    ],
    acceptedDate: String,
    acceptedTime: String,
    acceptedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },

    editEnabled: { type: Boolean, default: true },
    addedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
    updatedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },

    date: { type: String, default: () => moment().format("YYYY-MM-DD") },
    time: { type: String, default: () => moment().format("HH:mm:ss") },
    upDate: { type: String, default: () => moment().format("YYYY-MM-DD") },
    upTime: { type: String, default: () => moment().format("HH:mm:ss") },
  },
  { timestamps: true, collection: COLLECTIONS.PURCHASE }
);

const Purchase = model(COLLECTIONS.PURCHASE, schema);

export default Purchase;
