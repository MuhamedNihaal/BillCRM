import { Schema, model } from "mongoose";
import { COLLECTIONS } from "../config.js";

let schema = new Schema(
  {
    id: Number,
    name: String,
    phonecode: Number,
    sortname: String,
  },
  {
    timestamps: true,
    collection: COLLECTIONS.COUNTRY,
    toObject: { virtuals: true },
    toJSON: { virtuals: true },
  }
);

let Country = model(COLLECTIONS.COUNTRY, schema);

export default Country;
