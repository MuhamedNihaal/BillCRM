import mongoose from "mongoose";
import { COLLECTIONS } from "../config.js";

const customerRefreshTokenSchema = new mongoose.Schema(
  {
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: COLLECTIONS.CUSTOMER,
      required: true,
    },
    token: { type: String, required: true },
    blacklisted: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now, expires: "5d" },
  },
  { collection: COLLECTIONS.CUSTOMERWEBTOKEN }
);

const CustomerWebToken = mongoose.model(COLLECTIONS.CUSTOMERWEBTOKEN,customerRefreshTokenSchema);

export default CustomerWebToken;
