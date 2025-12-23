import mongoose from "mongoose";

let Schema = mongoose.Schema;
import COLLECTIONS from "@/config/collections.js";

const schema = new Schema(
  {
    status: { type: Number, default: 0, description: "0 - active, 1 - deleted" },

    _id: { type: String, required: true },
    value: { type: Number, default: 1 },
  },
  { timestamps: true, collection: COLLECTIONS.COUNTRY }
);

const index = mongoose.model(COLLECTIONS.COUNTRY, schema);
export default index;
