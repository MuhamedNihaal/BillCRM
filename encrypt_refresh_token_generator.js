import "dotenv/config";
import moment from "moment";
import { decodeAndEncode } from "./helper/functions.js";

// PAST HERE YOUR REFRESH TOKEN AND RUN THE CODE;
let RESPONSE_REFRESH_TOKEN = "";

let day = 7; // 7 or 30 days
const requestAt = moment().add(day, "day").format("YYYY-MM-DD HH:mm:ss");
let token = { token: RESPONSE_REFRESH_TOKEN, requestAt: requestAt };
console.log(decodeAndEncode(token));
