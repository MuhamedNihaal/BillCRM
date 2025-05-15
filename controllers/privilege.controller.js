import { asyncErrorHandler, Response, Error } from "express-error-catcher";
import { checkObjectIdValid, paginationValues, validateSpaceAndLetters } from "../helper/functions.js";
import models from "../models/index.js";
import { COLLECTIONS } from "../config.js";

export const list = asyncErrorHandler(async (req, res) => {
  let { skip, limit } = paginationValues(req.query);
  let { search } = req.query;

  let condition = { status: 0 };

  if (!isNull(search)) {
    condition.name = { $regex: search, $options: "i" };
  }

  let count = await models.Privilege.countDocuments(condition);
  let data = await models.Privilege.aggregate([
    { $match: condition },
    { $sort: { createdAt: -1 } },
    { $skip: skip },
    { $limit: limit },
    {
      $lookup: {
        from: COLLECTIONS.MODULES,
        let: { alloted_modules: "$alloted_modules" },
        pipeline: [
          { $match: { $and: [{ $expr: { $eq: ["$status", 0] } }] } },
          {
            $project: {
              _id: 1,
              moduleName: 1,
              alloted_modules: "$alloted_modules",
              allocation_status: {
                $cond: {
                  if: {
                    $in: ["$_id", { $ifNull: ["$$alloted_modules", []] }],
                  },
                  then: 1,
                  else: 0,
                },
              },
            },
          },
        ],
        as: "module",
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        code: 1,
        branch: 1,
        module: 1,
      },
    },
  ]);

  return new Response(null, { count, data }, 200);
});

export const add = asyncErrorHandler(async (req, res) => {
  try {
    let { name, code } = req.body;
    let userId = req.user?._id;
    let userName = req?.user?.firstName ?? req.user?.username;

    let validName = validateSpaceAndLetters(name);
    let validCode = validateSpaceAndLetters(code, "Code");

    let isAlreadyIn = await models.Privilege.findOne({
      $or: [{ name: validName }, { code: validCode }],
      status: 0,
    });

    if (isAlreadyIn) {
      let message = isAlreadyIn.name === validName ? "This name is already in use" : "This code is already in use";

      throw new Error(message, 400);
    }

    await models
      .Privilege({
        name: validName,
        code: validCode,
        addedBy: userId,
      })
      .save();

    await models
      .UserActivity({
        ip: req.ip,
        action: "New Privilege Added",
        user: userName,
        userId: req.user._id,
        description: `A new privileged '${validName}' has been added by the '${userName}'`,
      })
      .save();

    return new Response("privilege added successfully", null, 201);
  } catch (error) {
    throw new Error(error.message, error?.statusCode ?? 400);
  }
});

export const update = asyncErrorHandler(async (req, res) => {
  try {
    let privilegeId = req.params.privilegeId;
    let { name, code } = req.body;
    let userId = req.user?._id;
    let userName = req?.user?.firstName ?? req.user?.username;

    if (!checkObjectIdValid(privilegeId)) {
      throw new Error("Invalid privilege id provided", 400);
    }

    let validName = validateSpaceAndLetters(name);
    let validCode = validateSpaceAndLetters(code, "Code");

    let isSuperAdmin = await models.Privilege.findOne({
      _id: privilegeId,
      status: 0,
    });

    if (!isNull(isSuperAdmin) && isSuperAdmin.superAdmin) {
      throw new Error("admin role cannot update", 403);
    }

    let isAlreadyIn = await models.Privilege.findOne({
      _id: { $ne: privilegeId },
      $or: [{ name: validName }, { code: validCode }],
      status: 0,
    });

    if (isAlreadyIn && isAlreadyIn.name === validName) {
      throw new Error("This name is already in use", 400);
    } else if (isAlreadyIn && isAlreadyIn.code === validCode) {
      throw new Error("This code is already in use", 400);
    }

    let updated = await models.Privilege.findByIdAndUpdate(privilegeId, {
      name: validName,
      code: validCode,
      updatedBy: userId,
    });

    if (updated) {
      await models
        .UserActivity({
          ip: req.ip,
          action: "Privilege Edited",
          user: userName,
          userId: req.user._id,
          description: `Privilege '${validName}' has been edited by '${userName}'`,
        })
        .save();
    }

    return new Response("privilege updated successfully", null, 200);
  } catch (error) {
    console.log(error);
    throw new Error(error.message, error?.statusCode ?? 400);
  }
});

export const remove = asyncErrorHandler(async (req, res) => {
  let privilegeId = req.params.privilegeId;
  let userId = req.user?._id;
  let userName = req?.user?.firstName ?? req.user?.username;

  if (!checkObjectIdValid(privilegeId)) {
    throw new Error("Invalid privilege id provided", 400);
  }

  let isAlreadyIn = await models.Privilege.findOne({
    _id: privilegeId,
    status: 0,
  });
  if (isNull(isAlreadyIn)) {
    throw new Error("Invalid privilege id provided", 400);
  }

  if (isAlreadyIn.superAdmin) {
    throw new Error("admin role cannot remove", 403);
  }

  let updated = await models.Privilege.findByIdAndUpdate(privilegeId, {
    status: 1,
    updatedBy: userId,
  });

  if (updated) {
    await models
      .UserActivity({
        ip: req.ip,
        action: "Privilege Deleted",
        user: userName,
        userId: userId,
        description: `Privilege '${isAlreadyIn.name}' has been deleted by '${userName}'`,
      })
      .save();
  }

  return new Response("Privilege removed successfully", null, 200);
});
