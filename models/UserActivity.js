import mongoose from "mongoose";
import { COLLECTIONS } from "../config.js";
let Schema = mongoose.Schema;
import moment from "moment";
let userActivitySchema = new Schema(
  {
    ip: {
      type: Schema.Types.String,
    },
    action: {
      type: String,
    },
    show: {
      type: Boolean,
      default: true, // false will hide from user profile
    },
    date: {
      type: String,
      default: () => moment().format("YYYY-MM-DD"),
    },
    time: {
      type: String,
      default: () => moment().format("HH:mm:ss"),
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.USERS,
    },
    user: {
      type: Schema.Types.String, // firstName or username
    },
    description: {
      type: Schema.Types.String,
    },
  },
  { timestamps: true, collection: COLLECTIONS.USER_ACTIVITY_LOGS }
);

let userActivity = mongoose.model(
  COLLECTIONS.USER_ACTIVITY_LOGS,
  userActivitySchema
);

export default userActivity;
