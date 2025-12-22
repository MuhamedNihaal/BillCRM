import mongoose from "mongoose";

let Schema = mongoose.Schema;
import COLLECTIONS from "@/config/collections.js";
import commonFields from "@/utils/commonFields.js";

const schema = new Schema(
  {
    status: { type: Number, default: 0, description: "0 - active, 1 - deleted" },
    slab: { type: Number, enum: [1, 2, 3, 4] },
    name: { type: String, trim: true },
    uniqueId: { type: String, trim: true },
    email: { type: String, trim: true },
    mobile: { type: String, trim: true },

    location: { type: String, trim: true },
    district: { type: Schema.Types.ObjectId, ref: COLLECTIONS.DISTRICT },
    state: { type: Schema.Types.Number, ref: COLLECTIONS.STATE },

    ...commonFields,
  },
  { timestamps: true, collection: COLLECTIONS.CORPORATE }
);

const index = mongoose.model(COLLECTIONS.CORPORATE, schema);
export default index;
