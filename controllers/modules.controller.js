import { asyncErrorHandler, Response, Error } from "express-error-catcher";
import moment from "moment";
import { checkObjectIdValid, existedValue, paginationValues, validateSpaceAndLetters } from "../helper/functions.js";
import models from "../models/index.js";
import { COLLECTIONS } from "../config.js";
import { ModuleSchema } from "../utils/validation/module.validation.js";

export const list = asyncErrorHandler(async (req, res) => {
  let { skip, limit } = paginationValues(req.query);
  let { search } = req.query;
  let condition = { status: 0 };

  if (!isNull(search)) {
    condition.$or = [{ name: { $regex: search, $options: "i" } }, { code: { $regex: search, $options: "i" } }, { redirectUrl: { $regex: search, $options: "i" } }];
  }
  let count = await models.Modules.countDocuments(condition);
  let data = await models.Modules.find(condition)
    .lean()
    .populate("addedBy", "firstName lastName username")
    .populate("updatedBy", "firstName lastName username")
    .sort({ createdAt: -1 })
    .select("-__v -createdAt -updatedAt -status")
    .skip(skip)
    .limit(limit);
  return new Response(null, { count, data }, 200);
});

export const add = asyncErrorHandler(async (req, res) => {
  try {
    let { name, code, redirectUrl } = req.body;
    let userId = req.user?._id;
    let userName = req?.user?.firstName ?? req.user?.username;
    // if (req.fileError) throw new Error(req.fileError);

    let validName = validateSpaceAndLetters(name, "Name");
    let validCode = validateSpaceAndLetters(code, "Code");

    if (isNull(redirectUrl)) throw new Error("Please provide redirect url", 400);

    let isValidName = await models.Modules.findOne({
      $or: [{ name: { $regex: new RegExp(`^${validName}$`, "i") } }, { code: { $regex: new RegExp(`^${validCode}$`, "i") } }],
      status: 0,
    });

    if (isValidName && isValidName.name.toLowerCase() === validName.toLowerCase()) {
      throw new Error("This name already in use", 400);
    } else if (isValidName && isValidName.code.toLowerCase() === validCode.toLowerCase()) {
      throw new Error("This code already in use", 400);
    }

    let file = req.file;
    if (isNull(file)) throw new Error("Please provide module icon");
    file.newPath = file.destination.replace("public/", "") + "/" + req.file.filename;

    await models
      .Modules({
        name: validName,
        code: validCode,
        addedBy: userId,
        icon: file?.newPath,
        redirectUrl,
      })
      .save();

    await models
      .UserActivity({
        ip: req.ip,
        action: "New Module Added",
        user: userName,
        userId: req.user._id,
        description: `A new module '${validName}' has been added by the '${userName}'`,
      })
      .save();

    return new Response("Module added successfully", null, 201);
  } catch (error) {
    throw new Error(error.message, error?.statusCode ?? 400);
  }
});

export const update = asyncErrorHandler(async (req, res) => {
  try {
    let userId = req.user?._id;
    let userName = req?.user?.firstName ?? req.user?.username;

    let moduleId = req.params.moduleId;
    if (!checkObjectIdValid(moduleId)) {
      throw new Error("Invalid module provided", 400);
    }

    let isValidModule = await models.Modules.findOne({
      _id: moduleId,
      status: 0,
    });

    if (!isValidModule) throw new Error("Invalid module provided", 400);

    let { name, code, redirectUrl } = req.body;

    let obj = {};

    if (name) {
      obj.name = validateSpaceAndLetters(name, "Name");
    }

    if (redirectUrl) {
      obj.redirectUrl = redirectUrl;
    }

    if (code) {
      obj.code = validateSpaceAndLetters(code, "Code");
    }

    if (req.file) {
      obj.icon = req.file.destination.replace("public/", "") + "/" + req.file.filename;
    }

    let isAlreadyIn = await models.Modules.findOne({
      _id: { $ne: moduleId },
      $or: [{ name: { $regex: new RegExp(`^${obj?.name}$`, "i") } }, { code: { $regex: new RegExp(`^${obj?.code}$`, "i") } }],
      status: 0,
    });

    if (isAlreadyIn && isAlreadyIn.name.toLowerCase() === obj?.name.toLowerCase()) {
      throw new Error("This name already in use", 400);
    } else if (isAlreadyIn && isAlreadyIn.code.toLowerCase() === obj?.code.toLowerCase()) {
      throw new Error("This code already in use", 400);
    }

    let payload = {
      ...obj,
      updatedBy: userId,
      upDate: moment().format("YYYY-MM-DD"),
      upTime: moment().format("HH:mm:ss"),
    };

    let updated = await models.Modules.findOneAndUpdate({ _id: moduleId, status: 0 }, payload);

    if (updated) {
      await models
        .UserActivity({
          ip: req.ip,
          action: "Module Edited",
          user: userName,
          userId: userId,
          description: `Module '${isValidModule?.name}' has been updated by '${userName}'`,
        })
        .save();
    }

    return new Response("Module updated successfully", null, 200);
  } catch (error) {
    throw new Error(error.message, error?.statusCode ?? 400);
  }
});

export const remove = asyncErrorHandler(async (req, res) => {
  let moduleId = req.params.moduleId;
  if (!checkObjectIdValid(moduleId)) {
    throw new Error("Invalid module provided", 400);
  }
  let userId = req.user?._id;
  let userName = req?.user?.firstName ?? req.user?.username;

  let isAlreadyIn = await models.Modules.findOne({
    _id: moduleId,
    status: 0,
  });
  if (isNull(isAlreadyIn)) {
    throw new Error("Invalid module provided", 400);
  }

  let updated = await models.Modules.findByIdAndUpdate(moduleId, {
    status: 1,
    updatedBy: userId,
  });

  if (updated) {
    await models
      .UserActivity({
        ip: req.ip,
        action: "Module Deleted",
        user: userName,
        userId: userId,
        description: `Module '${isAlreadyIn.name}' has been deleted by '${userName}'`,
      })
      .save();
  }

  return new Response("Module removed successfully", null, 200);
});

export const ruleList = asyncErrorHandler(async (req, res) => {
  let { search, privilege, type, module, modules } = req.query;
  let data = [];
  let module_field = "";
  let lookUPConfig = {
    from: "",
    localField: "",
  };

  if (!isNull(privilege)) {
    if (type == 2) {
      module_field = "alloted_main_menus";
      lookUPConfig.from = COLLECTIONS.MODULES;
      lookUPConfig.localField = "module";
    } else if (type == 3) {
      module_field = "alloted_submenus";
      lookUPConfig.from = COLLECTIONS.MAIN_MENUS;
      lookUPConfig.localField = "mainMenu";
    }
  }

  let pipeline = [
    {
      $match: { status: 0, masterPath: false },
    },
    {
      $lookup: {
        from: "privileges",
        let: { menuId: "$_id" },
        pipeline: [
          {
            $match: {
              $expr: {
                $and: [{ $in: ["$$menuId", `$${module_field}.id`] }, { $eq: ["$_id", ObjectId(privilege)] }],
              },
            },
          },
          { $unwind: `$${module_field}` },
          {
            $match: {
              $expr: { $eq: [`$${module_field}.id`, "$$menuId"] },
            },
          },
          {
            $project: {
              _id: 0,
              create: `$${module_field}.create`,
              view: `$${module_field}.view`,
              edit: `$${module_field}.edit`,
              remv: `$${module_field}.remv`,
            },
          },
        ],
        as: "privilegeDetails",
      },
    },
    {
      $lookup: {
        from: lookUPConfig.from,
        localField: lookUPConfig.localField,
        foreignField: "_id",
        as: "details",
      },
    },
    {
      $project: {
        parent: { $arrayElemAt: ["$details.name", 0] },
        moduleId: {
          $ifNull: [{ $arrayElemAt: ["$details.module", 0] }, { $arrayElemAt: ["$details._id", 0] }],
        },
        name: 1,
        link: 1,
        icon: 1,
        create: { $arrayElemAt: ["$privilegeDetails.create", 0] },
        view: { $arrayElemAt: ["$privilegeDetails.view", 0] },
        edit: { $arrayElemAt: ["$privilegeDetails.edit", 0] },
        remv: { $arrayElemAt: ["$privilegeDetails.remv", 0] },
      },
    },
  ];

  if (!isNull(privilege)) {
    if (!isNull(modules)) {
      pipeline.push({
        $match: {
          moduleId: ObjectId(modules),
        },
      });
    }
    if (type == 2) {
      data = await models.MainMenu.aggregate(pipeline);
    } else if (type == 3) {
      data = await models.SubMenu.aggregate(pipeline);
    }
  } else if (!isNull(module) && type == 3) {
    data = await models.Privilege.aggregate([
      {
        $match: {
          status: 0,
          superAdmin: false,
        },
      },
      {
        $lookup: {
          from: COLLECTIONS.PRIVILEGES,
          let: {
            privilegeId: "$_id",
          },
          pipeline: [
            {
              $unwind: "$alloted_modules",
            },
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$_id", "$$privilegeId"],
                    },
                    {
                      $eq: ["$alloted_modules.id", ObjectId(module)],
                    },
                  ],
                },
              },
            },
            {
              $project: {
                _id: 0,
                status: "$alloted_modules.status",
              },
            },
          ],
          as: "privilegeDetails",
        },
      },
      {
        $addFields: {
          status: {
            $ifNull: [
              {
                $arrayElemAt: ["$privilegeDetails.status", 0],
              },
              false,
            ],
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: "$name",
          status: 1,
        },
      },
    ]);
  } else {
    data = [];
  }

  return new Response(null, { data }, 200);
});

export const rule = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;

  let options = await ModuleSchema(req.body);

  if (options?.error) {
    throw new Error(options.error);
  }

  let type = options?.type;
  let privilegeId = options?.privilegeId;

  let isValidPrivilege = await models.Privilege.findOne({
    _id: privilegeId,
    status: 0,
  });

  if (isNull(isValidPrivilege)) {
    throw new Error("Invalid privilege role provided", 400);
  }

  delete options.privilegeId;
  delete options.type;

  let field_name = "";
  let modelName = "";
  if (type == 1) {
    field_name = "alloted_modules";
    modelName = "Modules";
  }
  if (type == 2) {
    field_name = "alloted_main_menus";
    modelName = "MainMenu";
  }

  if (type == 3) {
    field_name = "alloted_submenus";
    modelName = "SubMenu";
  }

  let isFieldValid = await models[modelName]?.findOne({
    _id: options?.id,
    status: 0,
  });
  if (isNull(isFieldValid)) {
    let error = type == 1 ? "module" : type == 2 ? "menu" : "sub menu";
    throw new Error(`Invalid ${error} id provided`, 400);
  }

  if (type == 1 || type == 2 || type == 3) {
    let isAlreadyIn = await models.Privilege.findOne({
      _id: privilegeId,
      status: 0,
      [`${field_name}.id`]: options?.id,
    });

    if (isAlreadyIn) {
      let obj = {};
      if (!isNull(options.view)) obj[`${field_name}.$.view`] = options.view;
      if (!isNull(options.create)) {
        if (options.create) {
          obj[`${field_name}.$.view`] = true;
        }
        obj[`${field_name}.$.create`] = options.create;
      }

      if (!isNull(options.edit)) {
        if (options.edit) {
          obj[`${field_name}.$.view`] = true;
        }
        obj[`${field_name}.$.edit`] = options.edit;
      }

      if (!isNull(options.remv)) {
        if (options.remv) {
          obj[`${field_name}.$.view`] = true;
        }
        obj[`${field_name}.$.remv`] = options.remv;
      }
      if (!isNull(options.status)) obj[`${field_name}.$.status`] = options.status;

      await models.Privilege.findOneAndUpdate(
        {
          _id: privilegeId,
          [`${field_name}.id`]: options?.id,
        },
        {
          $set: obj,
        }
      );
    } else {
      await models.Privilege.findOneAndUpdate(
        { _id: privilegeId, status: 0 },
        {
          $push: { [field_name]: options },
        }
      );
    }
  }

  return new Response("Role update", null, 200);
});
