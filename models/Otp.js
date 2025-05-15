import mongoose, { Schema } from "mongoose";
import { COLLECTIONS } from "../config.js";
import moment from "moment";

let otpSchema = new Schema(
  {
    mobile:String,
    otp: {
      type: String,
    },
    used: {
      type: Boolean,
      default: false,
    },
    msg:String,
    date:{type: String,default:()=>moment().format('YYYY-MM-DD')},
    time:{type: String,default:()=>moment().format('HH:mm:ss')},
  },
  { timestamps: true, collection:COLLECTIONS.OTPMESSAGE}
);

let OTPMessage = mongoose.model(COLLECTIONS.OTPMESSAGE, otpSchema);

export default OTPMessage;
