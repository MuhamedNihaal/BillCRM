import { Schema, model } from "mongoose";
import { COLLECTIONS } from "../config.js";

const schema = new Schema(
  {
    _id: { type: String, required: true },
    value: { type: Number, default: 1 },
  },
  { timestamps: true, collection: COLLECTIONS.COUNTER }
);

export default model(COLLECTIONS.COUNTER, schema);
