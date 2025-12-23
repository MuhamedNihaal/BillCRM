import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";

import * as config from "@/config/security.js";
import COLLECTIONS from "@/config/collections.js";
import getTimeParam from "@/utils/getTimeParam.js";

const schema = new Schema(
  {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    username: { type: String, trim: true },
    mobile: { type: String, trim: true },
    email: { type: String, trim: true },

    password: { type: String },
    passwordChanged: { type: Boolean, default: false },

    gender: { type: Number, enum: [1, 2, 3] },
    image: { type: String, default: "" },
    dob: { type: String },


    privilege: { type: Schema.Types.ObjectId, ref: COLLECTIONS.PRIVILEGES },
    module: { type: Schema.Types.ObjectId, ref: COLLECTIONS.MODULES },

    type: {
      type: Number,
      enum: [1, 2, 3, 4, 5],
      required: true,
      description: "1 - Main Branch , 2 - Sub Branch , 3 - Franchise collection center , 4 - Owned collection center",
    },

    company: { type: Schema.Types.ObjectId, ref: COLLECTIONS.COMPANY },
    branch: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BRANCH },
    subBranch: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BRANCH },

    status: { type: Number, default: 0, enum: [0, 1, 2], description: "0 - active, 1 - deleted, 2 - blocked or inactive" },

    browserTokens: [
      {
        token: { type: String, required: true },
        lastUsed: { type: Date, default: Date.now },
        isActive: { type: Boolean, default: true },
      },
    ],

    login: { date: { type: String }, time: { type: String } },
    statusUpdate: {
      user: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
      date: { type: String },
      time: { type: String },
    },

    twoFactor: {
      enabled: { type: Boolean, default: false },
      used: Boolean,
      secret: String,
      qrCode: String,
      lastUsedOTP: String,
      lastUsed: String,
    },

    ip: { type: String },
    uniqueId: { type: String },

    addedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },
    updatedBy: { type: Schema.Types.ObjectId, ref: COLLECTIONS.USERS },

    date: { type: String, default: () => getTimeParam("date") },
    time: { type: String, default: () => getTimeParam("time") },
  },

  { timestamps: true, collection: COLLECTIONS.USERS }
);

schema.methods.generatePasswordHash = (password) => {
  const salt = bcrypt.genSaltSync(config.BCRYPT_SALT_ROUNDS);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
};

schema.methods.validatePassword = (password, hashedPassword) => {
  const res = bcrypt.compareSync(password, hashedPassword);
  return res;
};

export default model(COLLECTIONS.USERS, schema);
