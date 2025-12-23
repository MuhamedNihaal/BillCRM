import mongoose from "mongoose";
let Schema = mongoose.Schema;

import COLLECTIONS from "@/config/collections.js";

const schema = new Schema(
  {
    _id: { type: String, required: true },
    value: { type: Number, default: 1 },
  },
  { timestamps: true, collection: COLLECTIONS.COUNTER }
);

const index = mongoose.model(COLLECTIONS.COUNTER, schema);
export default index;
