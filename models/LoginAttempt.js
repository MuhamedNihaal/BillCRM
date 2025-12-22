import mongoose from "mongoose";
let Schema = mongoose.Schema;

import COLLECTIONS from "@/config/collections.js";
import getTimeParam from "@/utils/getTimeParam.js";

let schema = new Schema(
  {
    username: {
      type: String,
    },
    login_ip: {
      type: String,
    },
    login_on: {
      type: Date,
      default: () => getTimeParam("dateAndTimeWithSecond"),
    },
    status: {
      type: Number,
      default: 0,
      description: "0 - active, 2 - blocked",
    },
    attempts: {
      type: Number,
      description: "the count of attempts",
    },
    date: {
      type: String,
      default: () => getTimeParam("date"),
    },
    time: {
      type: String,
      default: () => getTimeParam("time"),
    },
    password: {
      type: String,
    },
    unblock_at: {
      type: Date,
      default: null,
      description: "Time when user will be unblocked",
    },
  },
  { timestamps: true, collection: COLLECTIONS.LOGIN_ATTEMPTS }
);

let loginAttempt = mongoose.model(COLLECTIONS.LOGIN_ATTEMPTS, schema);

export default loginAttempt;
