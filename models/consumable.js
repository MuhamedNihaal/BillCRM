import mongoose from "mongoose";

let Schema = mongoose.Schema;
import COLLECTIONS from "@/config/collections.js";
import commonFields from "@/utils/commonFields.js";

const schema = new Schema(
  {
    status: { type: Number, default: 0, description: "0 - active, 1 - deleted" },

    name: { type: String, trim: true },
    code: { type: String, trim: true },
    category: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.CONSUMABLE_CATEGORY,
    },

    ...commonFields,
  },
  { timestamps: true, collection: COLLECTIONS.CONSUMABLE }
);

const index = mongoose.model(COLLECTIONS.CONSUMABLE, schema);
export default index;
