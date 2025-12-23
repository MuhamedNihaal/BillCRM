import { asyncErrorHandler, Response, Error } from "express-error-catcher";

import { caseInsensitiveExact, checkObjectIdValid, paginationValues, querySearchSanitize, validateSpaceAndLetters } from "@/helper/index.js";
import models from "@/models/index.js";
import COLLECTIONS from "@/config/collections.js";
import userActivity, { ACTIVITY_ACTIONS } from "@/utils/userActivity.js";

export const list = asyncErrorHandler(async (req, res) => {
  let { skip, limit } = paginationValues(req.query);
  let { search } = req.query;

  let condition = { status: 0 };

  if (!isNull(search)) {
    search = querySearchSanitize(search);
    condition.$or = [{ name: { $regex: search, $options: "i" } }, { code: { $regex: search, $options: "i" } }];
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
        superAdmin: 1,
        code: 1,
        branch: 1,
        module: 1,
        date: 1,
        time: 1,
      },
    },
  ]);

  return new Response(null, { count, data }, 200);
});

export const add = asyncErrorHandler(async (req, res) => {
  try {
    let { name, code } = req.body;

    let validName = validateSpaceAndLetters(name);
    let validCode = validateSpaceAndLetters(code, "Code");

    let isAlreadyIn = await models.Privilege.findOne({
      $or: [{ name: validName }, { code: validCode }],
      status: 0,
    });

    if (isAlreadyIn) {
      let message = isAlreadyIn.name === validName ? "This name already exists" : "This code already exists";

      throw new Error(message, 400);
    }

    await models
      .Privilege({
        name: validName,
        code: validCode,
        addedBy: req.user?._id,
      })
      .save();

    userActivity({
      req,
      action: ACTIVITY_ACTIONS.CRUD.CREATE_RECORD,
      description: `A new privilege '${validName}' has been added by the {userName}`,
    });

    return new Response("privilege added successfully", null, 201);
  } catch (error) {
    throw new Error(error.message, error?.statusCode ?? 400);
  }
});

export const update = asyncErrorHandler(async (req, res) => {
  let privilegeId = req.params.privilegeId;
  let { name, code } = req.body;
  let userId = req.user?._id;

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
    throw new Error("this privilege cannot be edited or delete", 403);
  }

  let isAlreadyIn = await models.Privilege.findOne({
    _id: { $ne: privilegeId },
    $or: [{ name: caseInsensitiveExact(name) }, { code: caseInsensitiveExact(validCode) }],
    status: 0,
  });

  if (isAlreadyIn && isAlreadyIn.name === validName) {
    throw new Error("Name already exists", 400);
  } else if (isAlreadyIn && isAlreadyIn.code === validCode) {
    throw new Error("Code already exists", 400);
  }

  let updated = await models.Privilege.findByIdAndUpdate(privilegeId, {
    name: validName,
    code: validCode,
    updatedBy: userId,
  });

  if (updated) {
    userActivity({
      req,
      action: ACTIVITY_ACTIONS.CRUD.UPDATE_RECORD,
      description: `Privilege '${validName}' has been edited by the {userName}`,
    });

    return new Response("privilege updated successfully", null, 200);
  } else {
    throw new Error("Privilege not found", 404);
  }
});

export const remove = asyncErrorHandler(async (req, res) => {
  let privilegeId = req.params.privilegeId;
  let userId = req.user?._id;

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
    throw new Error("this privilege cannot be edited or delete", 403);
  }

  let updated = await models.Privilege.findByIdAndUpdate(privilegeId, {
    status: 1,
    updatedBy: userId,
  });

  if (updated) {
    userActivity({
      req,
      action: ACTIVITY_ACTIONS.CRUD.DELETE_RECORD,
      description: `Privilege '${validName}' has been deleted by the {userName}`,
    });
    return new Response("Privilege removed successfully", null, 200);
  } else {
    throw new Error("privilege not found", 404);
  }
});

export const moduleList = asyncErrorHandler(async (req) => {
  const { privilegeId } = req.params;
  if (!checkObjectIdValid(privilegeId)) {
    throw new Error("Invalid privilege provided", 400);
  }

  let { search } = req.query;
  let condition = { status: 0 };

  let isValidPrivilege = await models.Privilege.findOne({ status: 0, _id: privilegeId });
  if (!isValidPrivilege) {
    throw new Error("Privilege not found", 404);
  }

  if (!isNull(search)) {
    search = querySearchSanitize(search);
    condition.name = { $regex: search, $options: "i" };
  }

  let count = await models.Modules.countDocuments(condition);
  let data = await models.Modules.aggregate([
    {
      $match: condition,
    },
    {
      $sort: {
        _id: -1,
      },
    },
    {
      $lookup: {
        from: COLLECTIONS.PRIVILEGES_PERMISSION,
        let: {
          moduleId: "$_id",
        },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [
                  {
                    $eq: ["$module", "$$moduleId"],
                  },
                  {
                    $eq: ["$privilege", ObjectId(privilegeId)],
                  },
                ],
              },
              type: 1,
            },
          },
        ],
        as: "permissions",
      },
    },
    {
      $project: {
        _id: 1,
        name: 1,
        code: 1,
        icon: 1,
        status: {
          $cond: {
            if: {
              $gt: [
                {
                  $size: {
                    $filter: {
                      input: "$permissions",
                      as: "perm",
                      cond: { $eq: ["$$perm.enabled", true] },
                    },
                  },
                },
                0,
              ],
            },
            then: true,
            else: false,
          },
        },
      },
    },
  ]);

  return new Response("Module List", { count, data }, 200);
});
