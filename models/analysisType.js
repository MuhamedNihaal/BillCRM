import mongoose from "mongoose";

let Schema = mongoose.Schema;
import COLLECTIONS from "@/config/collections.js";
import commonFields from "@/utils/commonFields.js";

const schema = new Schema(
  {
    status: { type: Number, default: 0, description: "0 - active, 1 - deleted" },

    name: { type: String, trim: true },

    ...commonFields,
  },
  { timestamps: true, collection: COLLECTIONS.ANALYSIS_TYPE }
);

const index = mongoose.model(COLLECTIONS.ANALYSIS_TYPE, schema);
export default index;
