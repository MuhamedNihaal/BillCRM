import mongoose from "mongoose";

let Schema = mongoose.Schema;
import COLLECTIONS from "@/config/collections.js";
import commonFields from "@/utils/commonFields.js";

const schema = new Schema(
  {
    status: { type: Number, default: 0, description: "0 - active, 1 - deleted, 2 - inactive" },

    name: String,
    uniqueId: String,
    mobile: String,
    landline: String,
    email: String,
    logo: String,
    website: String,
    contactPerson: String,
    designation: String,
    address: String,

    state: { type: Number, ref: COLLECTIONS.STATE },
    district: { type: Schema.Types.ObjectId, ref: COLLECTIONS.DISTRICT },

    ...commonFields,
  },
  { timestamps: true, collection: COLLECTIONS.COMPANY }
);

const index = mongoose.model(COLLECTIONS.COMPANY, schema);
export default index;
