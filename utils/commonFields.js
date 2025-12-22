// commonFields.js
import { Schema } from "mongoose";
import getTimeParam from "@/utils/getTimeParam.js";
import COLLECTIONS from "@/config/collections.js";

const commonFields = {
  date: {
    type: String,
    default: () => getTimeParam("date"),
  },
  time: {
    type: String,
    default: () => getTimeParam("timeWithSecond"),
  },
  addedBy: {
    type: Schema.Types.ObjectId,
    ref: COLLECTIONS.USERS,
  },
  updatedBy: {
    type: Schema.Types.ObjectId,
    ref: COLLECTIONS.USERS,
  },
};

export { commonFields };
export default commonFields;
