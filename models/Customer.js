import mongoose, { Schema } from "mongoose";
import { COLLECTIONS } from "../config.js";
import moment from "moment";

let customerSchema = new Schema(
  {
    uniqueId: String,
    ip: String,
    status: { type: Number, default: 0 },
    firstName: String,
    lastName: String,
    email: String,
    mobile: String,
    pincode: String,
    dob: String,
    age: {
      year: Number,
      month: Number,
      day: Number,
    },
    gender: {
      type: Number,
      enum: [1, 2, 3], // 1 - male, 2 - female, 3 - non binary
    },
    city: String,
    address: String,
    district: { type: Schema.Types.ObjectId, ref: COLLECTIONS.DISTRICT },
    state: { type: Schema.Types.Number, ref: COLLECTIONS.STATE },
    country: { type: Schema.Types.ObjectId, ref: COLLECTIONS.COUNTRY },

    members: [
      {
        _id: false,
        member: { type: Schema.Types.ObjectId, ref: COLLECTIONS.CUSTOMER },
        relation: { type: Schema.Types.ObjectId, ref: COLLECTIONS.RELATION },
      },
    ],

    reason: String,
    category: { type: Schema.Types.ObjectId, ref: COLLECTIONS.CUSTOMER_CATEGORY },

    registered: { type: Boolean, default: false },
    date: {
      type: String,
      default: moment().format("YYYY-MM-DD"),
    },
    time: {
      type: String,
      default: moment().format("HH:mm:ss"),
    },
    appToken: String,
    uniqueId: String,
    version: String,
    appUser: [
      {
        type: Number,
        enum: [1, 2],
        description: "1 - app, 2 - web",
      },
    ],
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.USERS,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.USERS,
    },
  },
  { timestamps: true, collection: COLLECTIONS.CUSTOMER }
);

let customer = mongoose.model(COLLECTIONS.CUSTOMER, customerSchema);

export default customer;
