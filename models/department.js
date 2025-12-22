import mongoose from "mongoose";

let Schema = mongoose.Schema;
import COLLECTIONS from "@/config/collections.js";
import commonFields from "@/utils/commonFields.js";

const schema = new Schema(
  {
    status: { type: Number, default: 0, description: "0 - active, 1 - deleted" },
    name: { type: String },
    code: { type: String },

    ...commonFields,
  },
  { timestamps: true, collection: COLLECTIONS.DEPARTMENT }
);

const index = mongoose.model(COLLECTIONS.DEPARTMENT, schema);
export default index;
