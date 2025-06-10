import { Schema, model } from "mongoose";
import { COLLECTIONS } from "../config.js";

const schema = new Schema(
  {
    name: String,
    uniqueId: String,
    mobile: String,
    email: String,
    logo: String,
    contactPerson: String,
    designation: String,
    address: String,
    website: String,

    type: { type: Number, enum: [1, 2, 3], default: 1 }, // 1- Main, 2- Sub, 3- Franchise

    company: { type: Schema.Types.ObjectId, ref: COLLECTIONS.COMPANY },
    mainBranch: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BRANCH },
    department: [{ type: Schema.Types.ObjectId, ref: COLLECTIONS.DEPARTMENT }],

    officeAccount: { type: Schema.Types.ObjectId, ref: COLLECTIONS.CHART_OF_ACCOUNT },
    
    state: { type: Number, ref: COLLECTIONS.STATE },
    district: { type: Schema.Types.ObjectId, ref: COLLECTIONS.DISTRICT },

    status: { type: Number, enum: [0, 1, 2], default: 0 },  // 0- Active, 1- Deleted, 2- Inactive

    date: { type: String, default: () => moment().format("YYYY-MM-DD") },
    time: { type: String, default: () => moment().format("HH:mm:ss") },
    upTime: String,
    upDate: String,
    addedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
    updatedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS }
  },
  { timestamps: true, collection: COLLECTIONS.BRANCH }
)

export default model(COLLECTIONS.BRANCH, schema);