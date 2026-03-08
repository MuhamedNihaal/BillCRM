import { Schema, model } from "mongoose";
import { COLLECTIONS } from "../config.js";

const schema = new Schema(
  {
    name: String,

    mrp: Number,
    specialPrice: Number,
    gst: Number,
    gstAmount: Number,
    cost: Number,
    primaryUnit: Number, // 1- Litre, 2- Box, 3- Number, 4- Unit, 5- Packet

    status: { type: Number, enum: [0, 1, 2], default: 0 }, // 0- Active, 1- Deleted, 2- Inactive

    date: { type: String, default: () => moment().format("YYYY-MM-DD") },
    time: { type: String, default: () => moment().format("HH:mm:ss") },
    upTime: String,
    upDate: String,
    addedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
    updatedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
  },
  { timestamps: true, collection: COLLECTIONS.PRODUCT },
);

export default model(COLLECTIONS.PRODUCT, schema);
