import mongoose, { Schema } from "mongoose";
import { COLLECTIONS } from "../config.js";

let stateSchema = new Schema(
  {
    _id: Number,

    name: String,
    countryId: Number,

    id: { type: Number, required: true },
    country_id: Number,
  },
  { timestamps: true, collection: COLLECTIONS.STATE }
);

export default mongoose.model(COLLECTIONS.STATE, stateSchema);
