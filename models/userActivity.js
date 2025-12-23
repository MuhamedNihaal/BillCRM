import mongoose from "mongoose";
import COLLECTIONS from "@/config/collections.js";
import getTimeParam from "@/utils/getTimeParam.js";

const { Schema } = mongoose;

const schema = new Schema(
  {
    ip: {
      type: Schema.Types.String,
    },
    action: {
      type: String,
    },
    show: {
      type: Boolean,
      default: false,
      description: "Whether to show this activity in user logs, [ false will hide from user profile ]",
    },
    reference: {
      type: Schema.Types.Mixed,
    },
    changedBy: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.USERS,
    },
    user: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.USERS,
    },
    description: {
      type: Schema.Types.String,
    },

    deviceId: String,

    date: {
      type: String,
      default: () => getTimeParam("date"),
    },
    time: {
      type: String,
      default: () => getTimeParam("time"),
    },
  },
  { timestamps: true, collection: COLLECTIONS.USER_ACTIVITY_LOGS }
);

const userActivity = mongoose.model(COLLECTIONS.USER_ACTIVITY_LOGS, schema);

export default userActivity;
