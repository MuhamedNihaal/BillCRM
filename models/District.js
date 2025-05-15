import { Schema, model } from "mongoose";
import { COLLECTIONS } from "../config.js";

const schema = new Schema(
  {
    name: String,
    state: Number,
    country: Number,
    status: { type: Number, default: 0 },
  },
  { timestamps: true, collection: COLLECTIONS.DISTRICT }
);

export default model(COLLECTIONS.DISTRICT, schema);
