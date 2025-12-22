import mongoose from "mongoose";

let Schema = mongoose.Schema;
import COLLECTIONS from "@/config/collections.js";

const schema = new Schema(
  {
    status: { type: Number, default: 0, description: "0 - active, 1 - deleted" },

    _id: Number,

    name: String,
    countryId: Number,

    id: { type: Number, required: true },
    country_id: Number,
  },
  { timestamps: true, collection: COLLECTIONS.STATE }
);

const index = mongoose.model(COLLECTIONS.STATE, schema);
export default index;
