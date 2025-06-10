import { Schema, model } from "mongoose";
import bcrypt from "bcryptjs";
import moment from "moment";

import { COLLECTIONS } from "../config.js";

const schema = new Schema(
  {
    firstName: { type: String },
    lastName: { type: String },
    username: { type: String },
    mobile: { type: String },
    email: { type: String },

    password: { type: String },
    passwordChanged: { type: Boolean, default: false },

    gender: { type: Number, enum: [1, 2, 3] },
    image: { type: String, default: "" },
    dob: { type: String },

    privilege: { type: Schema.Types.ObjectId, ref: COLLECTIONS.PRIVILEGES },
    module: { type: Schema.Types.ObjectId, ref: COLLECTIONS.MODULES },

    type: { type: Number, enum: [1, 2, 3, 4, 5], default: 5 }, // 1- Main Branch, 2- Sub Branch, 3- Franchise, 4- collection center

    company: { type: Schema.Types.ObjectId, ref: COLLECTIONS.COMPANY },
    branch: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BRANCH },
    subBranch: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BRANCH },
    franchise: { type: Schema.Types.ObjectId, ref: COLLECTIONS.BRANCH },
    department: { type: Schema.Types.ObjectId, ref: COLLECTIONS.DEPARTMENT },

    status: { type: Number, default: 0, enum: [0, 1, 2] }, // 2 is blocked or inactive
    browserToken: { type: String },

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

    date: { type: String, default: () => moment().format("YYYY-MM-DD") },
    time: { type: String, default: () => moment().format("HH:mm:ss") },

    upDate: { type: String, default: () => moment().format("YYYY-MM-DD") },
    upTime: { type: String, default: () => moment().format("HH:mm:ss") },
  },

  { timestamps: true, collection: COLLECTIONS.USERS }
);

schema.methods.generatePasswordHash = (password) => {
  const saltRounds = 10;
  const salt = bcrypt.genSaltSync(saltRounds);
  const hash = bcrypt.hashSync(password, salt);
  return hash;
};

schema.methods.validatePassword = (password, hashedPassword) => {
  const res = bcrypt.compareSync(password, hashedPassword);
  return res;
};

export default model(COLLECTIONS.USERS, schema);
