import mongoose from "mongoose";

let Schema = mongoose.Schema;
import COLLECTIONS from "@/config/collections.js";
import commonFields from "@/utils/commonFields.js";

const schema = new Schema(
  {
    name: { type: String, trim: true, required: true },
    status: { type: Number, default: 0, description: "0 - active, 1 - deleted" },
    head: { type: Schema.Types.ObjectId, ref: COLLECTIONS.ACCOUNT_HEAD, required: true },
    ip: { type: String },

    ...commonFields,
  },
  { timestamps: true, collection: COLLECTIONS.ACCOUNT_SUB_HEAD }
);

const index = mongoose.model(COLLECTIONS.ACCOUNT_SUB_HEAD, schema);
export default index;
