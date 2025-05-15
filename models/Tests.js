import mongoose from "mongoose";
let Schema = mongoose.Schema;
import { COLLECTIONS } from "../config.js";
import moment from "moment";

let schema = new Schema(
  {
    status: { type: Number, default: 0 }, // 0 - active, 1 - delete or inactive

    name: { type: String },
    type: {
      type: Number,
      enum: [1, 2, 3, 4, 5, 6], // 1 - test, 2 - group, 3 - packages, 4 - culture, 5 - examination, 6 - sub package
      required: true,
    },
    department: { type: Schema.Types.ObjectId, ref: COLLECTIONS.DEPARTMENT },
    method: { type: Schema.Types.ObjectId, ref: COLLECTIONS.METHODS },
    unit: { type: Schema.Types.ObjectId, ref: COLLECTIONS.UNITS },

    targetMachine: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.TARGET_MACHINES,
    },
    
    analysisType: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.ANALYSIS_TYPE,
    },

    duration: Number,
    shortCode: String,
    price: Number,
    cost: Number,
    branchPrice: [
      {
        _id: false,
        branch: {
          type: Schema.Types.ObjectId,
          ref: COLLECTIONS.BRANCH,
        },
        price: {
          type: Number,
        },
      },
    ],
    slabs: [
      {
        _id: false,
        slab: { type: Number, enum: [1, 2, 3, 4] },
        price: Number,
      },
    ],
    specificSlab: [
      {
        _id: false,
        corporate: {
          type: Schema.Types.ObjectId,
          ref: COLLECTIONS.CORPORATE,
        },
        price: Number,
      },
    ],
    investigation: {
      type: Boolean,
      default: false,
    },
    services: {
      type: Boolean,
      default: false,
    },
    individual: {
      type: Boolean,
      default: false,
    },
    graph: {
      type: Boolean,
      default: false,
    },
    fasting: {
      type: Boolean,
      default: false,
    },
    outSource: {
      type: Boolean,
      default: false,
    },
    outSourceLab: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.LAB,
    },
    referenceRange: {
      type: Number,
      enum: [0, 1, 2, 3], // 0 - No range, 1 - Specific, 2 - Range, 3 - Parametric,
      default: 0,
    },

    referenceRanges: [
      {
        _id: false,
        gender: {
          type: Number,
          enum: [1, 2], // 1 - male, 2 - female
        },
        ageFrom: Number,
        ageTo: Number,
        value: Number,
        lessThan: Number,
        greaterThan: Number,
        from: Number,
        to: Number,

        parametric: {
          type: Schema.Types.ObjectId,
          ref: COLLECTIONS.RANGE_TYPE,
        },
        rangeType: {
          // This is for parametric range type reference
          type: Number,
          enum: [1, 2, 3], // 1 - less than, 2 - greater than, 3 - range
        },
      },
    ],

    assignBranch: [
      {
        _id: false,
        type: Schema.Types.ObjectId,
        ref: COLLECTIONS.BRANCH,
      },
    ],

    consumables: [
      {
        _id: false,
        consumable: {
          type: Schema.Types.ObjectId,
          ref: COLLECTIONS.CONSUMABLE,
        },
        unit: Number,
      },
    ],
    description: String,
    date: {
      type: String,
      default: moment().format("YYYY-MM-DD"),
    },
    time: {
      type: String,
      default: moment().format("HH:mm:ss"),
    },
    addedBy: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.USERS,
    },
    updatedBy: {
      type: Schema.Types.ObjectId,
      ref: COLLECTIONS.USERS,
    },
  },
  { timestamps: true, collection: COLLECTIONS.TEST }
);

let index = mongoose.model(COLLECTIONS.TEST, schema);

export default index;
