import mongoose from "mongoose";
import moment from "moment";
import { COLLECTIONS } from "../config.js";
let Schema = mongoose.Schema;

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
      default: () => moment().format("YYYY-MM-DD HH:mm:ss"),
    },
    status: {
      type: Number,
      default: 0, // 0 is active, 2 is blocked
    },
    attempts: {
      type: Number, // the count of attempts
    },
    date: {
      type: String,
      default: () => moment().format("YYYY-MM-DD"),
    },
    time: {
      type: String,
      default: () => moment().format("HH:mm:ss"),
    },
    password: {
      type: String,
    },
    unblock_at: {
      type: Date,
      default: null, // Time when user will be unblocked
    },
  },
  { timestamps: true, collection: COLLECTIONS.LOGIN_ATTEMPTS }
);
let LoginAttempt = mongoose.model(COLLECTIONS.LOGIN_ATTEMPTS, schema);

export default LoginAttempt;
