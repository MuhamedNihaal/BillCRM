import { asyncErrorHandler, Error, Response } from "express-error-catcher";

//! Local Imports
import { querySearchSanitize } from "@/helper/queryRequest.js";
import models from "@/models/index.js";

export const search = asyncErrorHandler(async (req) => {
  let { search: keyword } = req.query;

  keyword = querySearchSanitize(keyword);

  console.log("Search Keyword:", keyword);
  const regex = new RegExp(keyword, "i");

  let data = {};

  if (isNull(keyword)) {
    throw new Error("Search keyword is required", 200, { data });
  }

  let [user, customer] = await Promise.all([
    models.User.find({
      status: 0,
      $or: [
        {
          $expr: {
            $regexMatch: {
              input: { $concat: ["$firstName", " ", "$lastName"] },
              regex: regex,
            },
          },
        },
        { email: regex },
        { phone: regex },
      ],
    })
      .limit(10)
      .sort({ _id: -1 })
      .populate("privilege", "name")
      .select({
        firstName: 1,
        lastName: 1,
        username: 1,
        email: 1,
        mobile: 1,
        privilege: 1,
        path: { $concat: ["/master-setting/users/", "$uniqueId"] },
      }),

    // models.Customer.find({
    //   status: { $ne: 1 },
    //   $or: [
    //     {
    //       $expr: {
    //         $regexMatch: {
    //           input: { $concat: ["$firstName", " ", "$lastName"] },
    //           regex: regex,
    //         },
    //       },
    //     },
    //     { email: regex },
    //     { mobile: regex },
    //     { location: regex },
    //   ],
    // })
    //   .limit(10)
    //   .sort({ _id: -1 })
    //   .select({
    //     name: {
    //       $concat: [{ $ifNull: ["$firstName", ""] }, " ", { $ifNull: ["$lastName", ""] }],
    //     },
    //     email: 1,
    //     additionalDetails: { mobile: "$mobile", location: "$location" },
    //     path: { $concat: ["/customer/list/", "$uniqueId"] },
    //   }),
  ]);

  if (user?.length > 0) data.user = user;
  if (customer?.length > 0) data.customer = customer;

  return new Response("Search results for query: " + keyword, { data }, 200);
});
