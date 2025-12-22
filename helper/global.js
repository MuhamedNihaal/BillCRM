import { Types } from "mongoose";
import moment from "moment";

global.isNull = (field) => {
  return field === undefined || field === "undefined" || field === "" || field === null || field === "null";
};

global.ObjectId = (obj) => new Types.ObjectId(obj);

global.moment = moment;

global.CONCAT_NAME = Object.freeze({
  $concat: [{ $ifNull: ["$firstName", ""] }, " ", { $ifNull: ["$lastName", ""] }],
});

global.CONCAT_NAME_2 = Object.freeze({
  $ifNull: [
    "$name",
    {
      $concat: [{ $ifNull: ["$firstName", ""] }, " ", { $ifNull: ["$lastName", ""] }],
    },
  ],
});

global.USER_BY = Object.freeze({
  username: 1,
  firstName: 1,
  lastName: 1,
  name: { $concat: [{ $ifNull: ["$firstName", ""] }, " ", { $ifNull: ["$lastName", ""] }] },
});

global.OPTIONS_FIELD = Object.freeze({
  label: global.CONCAT_NAME_2,
  value: "$_id",
  name: global.CONCAT_NAME_2,
});
