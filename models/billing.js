import mongoose from "mongoose";
let Schema = mongoose.Schema;

import COLLECTIONS from "@/config/collections.js";
import getTimeParam from "@/utils/getTimeParam.js";

const schema = new Schema({}, { timestamps: true, collection: COLLECTIONS.BILLING });

export default mongoose.model(COLLECTIONS.BILLING, schema);
