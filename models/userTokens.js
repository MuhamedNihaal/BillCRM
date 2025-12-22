import mongoose from "mongoose";
import COLLECTIONS from "@/config/collections.js";
import getTimeParam from "@/utils/getTimeParam.js";

const { Schema } = mongoose;

const schema = new Schema(
  {
    ip: String,

    user: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.USERS,
      required: true,
    },

    deviceId: {
      type: String,
      trim: true,
      unique: true,
    },

    production: { type: Boolean, default: true },

    os: String,
    platform: String,
    deviceType: String,
    browser: String,

    token: {
      type: String,
      required: true,
      trim: true,
    },

    date: {
      type: String,
      default: () => getTimeParam("date"),
    },
    time: {
      type: String,
      default: () => getTimeParam("time"),
    },

    createdAt: { type: Date, default: Date.now, expires: "31d" },
  },
  { collection: COLLECTIONS.USER_TOKEN }
);

const userTokens = mongoose.model(COLLECTIONS.USER_TOKEN, schema);

export default userTokens;
