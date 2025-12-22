import mongoose from "mongoose";

let Schema = mongoose.Schema;
import COLLECTIONS from "@/config/collections.js";

const schema = new Schema(
  {
    status: { type: Number, default: 0, description: "0 - active, 1 - deleted" },

    name: String,
    state: Number,
    country: Number,
  },
  { timestamps: true, collection: COLLECTIONS.DISTRICT }
);

const index = mongoose.model(COLLECTIONS.DISTRICT, schema);
export default index;
