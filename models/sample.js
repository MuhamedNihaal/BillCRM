import mongoose from "mongoose";

let Schema = mongoose.Schema;
import COLLECTIONS from "@/config/collections.js";
import commonFields from "@/utils/commonFields.js";

const schema = new Schema(
  {
    status: { type: Number, default: 0, description: "0 - active, 1 - deleted" },

    name: { type: String, trim: true },
    examination: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.TEST,
    },
    culture: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.TEST,
    },
    type: {
      type: Number,
      default: [1, 2],
      description: "1 - examination, 2 - culture",
    },

    ...commonFields,
  },
  { timestamps: true, collection: COLLECTIONS.RANGE_TYPE }
);

const index = mongoose.model(COLLECTIONS.RANGE_TYPE, schema);
export default index;
