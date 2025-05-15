import mongoose, { Schema } from "mongoose";
import { COLLECTIONS } from "../config.js";
import moment from "moment";

let relationSchema = new Schema(
  {
   ip:String,
   status:{type:Number,default:0},
   name:String,
   date: { type: String, default: () => moment().format("YYYY-MM-DD") },
   time: { type: String, default: () => moment().format("HH:mm:ss") },
  },
  { timestamps: true, collection:COLLECTIONS.RELATION}
);

let Relation = mongoose.model(COLLECTIONS.RELATION, relationSchema);

export default Relation;
