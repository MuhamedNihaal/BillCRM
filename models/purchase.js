import mongoose from "mongoose";
let Schema = mongoose.Schema;
import * as security from "@/config/security.js";
import COLLECTIONS from "@/config/collections.js";
import commonFields from "@/utils/commonFields.js";

const schema = new Schema(
  {
    ip: String,
    status: { type: Number, default: 2 }, // 0- Accepted, 1- Deleted, 2- Pending
    paymentStatus: { type: Number, default: 0 }, // 0 - Unpaid, 1 - Paid
    uniqueId: String,
    billDate: String,
    billNum: String,

    totalAmount: Number,
    taxableAmount: Number,
    gstAmount: Number,
    grandTotal: Number,
    paidAmount: { type: Number, default: 0 },
    gst: [
      {
        percentage: Number,
        amount: Number,
        cgstPercentage: Number,
        cgstAmount: Number,
        scgstPercentage: Number,
        scgstAmount: Number,
      },
    ],

    supplier: {
      type: Schema.Types.ObjectId,
      required: true,
      ref: COLLECTIONS.SUPPLIER,
    },

    attachment: String,
    items: [
      {
        product: { type: Schema.Types.ObjectId, ref: COLLECTIONS.PRODUCT },
        quantity: Number,
        unit: Number,
        mrp: Number,
        rate: Number,
        price: Number,
        gst: Number,
        amount: Number,
        status: { type: Number, default: 1 }, // 0- Accepted, 1- Pending
      },
    ],
    editEnabled: { type: Boolean, default: true },

    ...commonFields,
  },
  { timestamps: true, collection: COLLECTIONS.PURCHASE },
);

export default mongoose.model(COLLECTIONS.PURCHASE, schema);
