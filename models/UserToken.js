import mongoose from "mongoose";
import { COLLECTIONS } from "../config.js";

const userRefreshTokenSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: COLLECTIONS.USER,
      required: true,
    },
    deviceId: { type: String },

    os: String,
    platform: String,
    deviceType: String,
    browser: String,

    token: { type: String, required: true },
    blacklisted: { type: Boolean, default: false },
    expiresAt: Date,
    createdAt: { type: Date, default: Date.now, expires: "30d" },
  },
  { collection: COLLECTIONS.USER_TOKEN }
);

const userToken = mongoose.model(COLLECTIONS.USER_TOKEN, userRefreshTokenSchema);

export default userToken;
