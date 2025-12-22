import mongoose from "mongoose";

let Schema = mongoose.Schema;
import COLLECTIONS from "@/config/collections.js";
import commonFields from "@/utils/commonFields.js";

const schema = new Schema(
  {
    name: { type: String, trim: true, required: true },
    status: { type: Number, default: 0, description: "0 - active, 1 - deleted" },

    ...commonFields,
  },
  { timestamps: true, collection: COLLECTIONS.ACCOUNT_HEAD }
);

const index = mongoose.model(COLLECTIONS.ACCOUNT_HEAD, schema);
export default index;
