import { asyncErrorHandler, Response, Error } from "express-error-catcher";

import { caseInsensitiveExact, checkObjectIdValid, isSame, paginationValues, querySearchSanitize, validateSpaceAndLetters } from "@/helper/index.js";
import models from "@/models/index.js";
import { ruleSchema } from "@/validation/module.validation.js";
import COLLECTIONS from "@/config/collections.js";
import getTimeParam from "@/utils/getTimeParam.js";
import * as security from "@/config/security.js";
import userActivity from "@/utils/userActivity.js";

export const list = asyncErrorHandler(async (req, res) => {
  let { skip, limit } = paginationValues(req.query);
  let { search } = req.query;
  let condition = { status: 0 };

  if (!isNull(search)) {
    search = querySearchSanitize(search);
    condition.$or = [
      { name: { $regex: search, $options: "i" } },
      { code: { $regex: search, $options: "i" } },
      { redirectUrl: { $regex: search, $options: "i" } },
    ];
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

export const update = asyncErrorHandler(async (req, res) => {
  try {
    let userId = req.user?._id;
    let userName = req?.user?.firstName ?? req.user?.username;

    let moduleId = req.params.moduleId;
    if (!checkObjectIdValid(moduleId)) {
      throw new Error("Invalid module provided", 400);
    }

    if (isSame(moduleId, security.MASTER_MODULE)) {
      throw new Error("This module cannot be edited at this time", 400);
    }

    let isValidModule = await models.Modules.findOne({
      _id: moduleId,
      status: 0,
    });

    if (!isValidModule) throw new Error("Invalid module provided", 400);

    let { name, code, redirectUrl, icon } = req.body;

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

    if (icon) {
      obj.icon = icon;
    }

    let isAlreadyIn = await models.Modules.findOne({
      _id: { $ne: moduleId },
      $or: [{ name: caseInsensitiveExact(obj?.name) }, { code: caseInsensitiveExact(obj?.code) }],
      status: 0,
    });

    if (isAlreadyIn && isAlreadyIn.name.toLowerCase() === obj?.name.toLowerCase()) {
      throw new Error("Name already exists", 400);
    } else if (isAlreadyIn && isAlreadyIn.code.toLowerCase() === obj?.code.toLowerCase()) {
      throw new Error("Code already exists", 400);
    }

    let payload = {
      ...obj,
      updatedBy: userId,
      upDate: getTimeParam("date"),
      upTime: getTimeParam("timeWithSecond"),
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

export const rulesList = asyncErrorHandler(async (req) => {
  let { privilege, module, type } = req.query;

  let condition = {
    status: 0,
  };

  if (checkObjectIdValid(module)) {
    condition._id = ObjectId(module);
  }

  let data = [];

  if (checkObjectIdValid(module) && type == 3) {
    let condition = {
      status: 0,
    };

    data = await models.Privilege.aggregate([
      {
        $match: condition,
      },
      {
        $lookup: {
          from: COLLECTIONS.PRIVILEGES_PERMISSION,
          let: {
            privilegeId: "$_id",
          },
          pipeline: [
            {
              $match: {
                $expr: {
                  $and: [
                    {
                      $eq: ["$privilege", "$$privilegeId"],
                    },
                    {
                      $eq: ["$module", ObjectId(module)],
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
          name: "$name",
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
  } else if (checkObjectIdValid(privilege)) {
    let getStatus = (key, field = "permissions") => ({
      $cond: [
        {
          $gt: [
            {
              $size: {
                $filter: {
                  input: `$${field}`,
                  as: "perm",
                  cond: { $eq: [`$$perm.${key}`, true] },
                },
              },
            },
            0,
          ],
        },
        true,
        false,
      ],
    });

    data = await models.Modules.aggregate([
      {
        $match: condition,
      },
      { $sort: { order: 1 } },
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
                      $eq: ["$privilege", ObjectId(privilege)],
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
        $lookup: {
          from: COLLECTIONS.MAIN_MENUS,
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
                  ],
                },
                status: 0,
              },
            },
            { $sort: { order: 1 } },
            {
              $lookup: {
                from: COLLECTIONS.PRIVILEGES_PERMISSION,
                let: {
                  mainId: "$_id",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          {
                            $eq: ["$mainMenu", "$$mainId"],
                          },
                          {
                            $eq: ["$privilege", ObjectId(privilege)],
                          },
                        ],
                      },
                      type: 2,
                    },
                  },
                ],
                as: "permissions",
              },
            },
            {
              $lookup: {
                from: COLLECTIONS.SUB_MENUS,
                let: {
                  mainId: "$_id",
                },
                pipeline: [
                  {
                    $match: {
                      $expr: {
                        $and: [
                          {
                            $eq: ["$mainMenu", "$$mainId"],
                          },
                        ],
                      },
                      status: 0,
                    },
                  },
                  { $sort: { order: 1 } },
                  {
                    $lookup: {
                      from: COLLECTIONS.PRIVILEGES_PERMISSION,
                      let: {
                        subId: "$_id",
                      },
                      pipeline: [
                        {
                          $match: {
                            $expr: {
                              $and: [
                                {
                                  $eq: ["$subMenu", "$$subId"],
                                },
                                {
                                  $eq: ["$privilege", ObjectId(privilege)],
                                },
                              ],
                            },
                            type: 3,
                          },
                        },
                      ],
                      as: "permissions",
                    },
                  },
                  {
                    $project: {
                      name: 1,
                      icon: 1,

                      enabled: getStatus("enabled"),
                      create: getStatus("create"),
                      view: getStatus("view"),
                      edit: getStatus("edit"),
                      remv: getStatus("remv"),
                    },
                  },
                ],
                as: "subMenus",
              },
            },
            {
              $project: {
                name: 1,
                icon: 1,

                subMenus: 1,

                enabled: getStatus("enabled"),
                create: getStatus("create"),
                view: getStatus("view"),
                edit: getStatus("edit"),
                remv: getStatus("remv"),
              },
            },
          ],
          as: "mainMenus",
        },
      },
      {
        $project: {
          name: 1,
          code: 1,
          mainMenus: 1,
          moduleStatus: getStatus("enabled"),
        },
      },
    ]);
  }

  return new Response("Rules List", { data: data }, 200);
});

export const rules = asyncErrorHandler(async (req) => {
  const payload = await ruleSchema(req.body);

  const reference = { ...payload };

  let { privilegeId, type, moduleId, menuId, subMenuId, fullEnable, ...rest } = payload;

  const typeMap = {
    1: { field: "alloted_modules", model: "Modules", label: "module", permission_field: "module", permission_type: 1 },
    2: { field: "alloted_main_menus", model: "MainMenu", label: "menu", permission_field: "mainMenu", permission_type: 2 },
    3: { field: "alloted_submenus", model: "SubMenu", label: "sub menu", permission_field: "subMenu", permission_type: 3 },
    4: { field: "alloted_modules", model: "Modules", label: "module", permission_field: "module", permission_type: 1 },
  };

  const config = typeMap[type];
  if (!config) throw new Error("Invalid type provided", 400);

  const privilege = await models.Privilege.findOne({ _id: privilegeId, status: 0 });
  if (!privilege) throw new Error("Invalid privilege", 400);

  if (isSame(privilegeId, security.privilege.SUPER_ADMIN) && isSame(moduleId, security.MASTER_MODULE)) {
    throw new Error("You cannot revoke the Master Module permission from the Super Admin role.", 403);
  }

  const isFieldValid = await models[config.model]?.findOne({ _id: rest.id, status: 0 }).select("name");
  if (!isFieldValid) {
    throw new Error(`Invalid ${config.label} id provided`, 400);
  }

  const existingEntry = await models.PrivilegePermission.findOne({
    privilege: privilegeId,
    type: config.permission_type,
    [`${config.permission_field}`]: rest.id,
  }).lean();

  const setFieldPermission = (permission = {}) => {
    if (!permission.enabled) {
      return { ...permission, create: false, edit: false, remv: false, view: false };
    }
    if (permission.create || permission.edit || permission.remv) permission.view = true;
    return permission;
  };

  // full access - [ Module ] - level
  const giveFullAccess = async () => {
    const modules = [{ type: 1, privilege: privilegeId, module: moduleId, enabled: true }];

    const mainMenus = await models.MainMenu.find({ status: 0, module: moduleId }).select("_id module").lean();
    const subMenus = await models.SubMenu.find({ status: 0, mainMenu: { $in: mainMenus.map((m) => m._id) } })
      .select("_id mainMenu")
      .lean();

    const menuDocs = mainMenus.map((m) => ({
      type: 2,
      privilege: privilegeId,
      module: moduleId,
      mainMenu: m._id,
      enabled: true,
      view: true,
      create: true,
      edit: true,
      remv: true,
    }));

    const subMenuDocs = subMenus.map((s) => ({
      type: 3,
      privilege: privilegeId,
      module: moduleId,
      mainMenu: s.mainMenu,
      subMenu: s._id,
      enabled: true,
      view: true,
      create: true,
      edit: true,
      remv: true,
    }));

    await models.PrivilegePermission.deleteMany({ privilege: privilegeId, module: moduleId });
    await models.PrivilegePermission.insertMany([...modules, ...menuDocs, ...subMenuDocs]);
  };

  // full access - [ sub menu ] - level
  const giveFullSubmenu = async (obj, onlyEnable = false) => {
    const subMenus = await models.SubMenu.find({ status: 0, mainMenu: obj.mainMenu }).select("_id mainMenu").lean();

    const data = subMenus.map((s) => ({
      type: 3,
      privilege: privilegeId,
      module: moduleId,
      mainMenu: obj.mainMenu,
      subMenu: s._id,
      enabled: true,
      ...(onlyEnable ? {} : { view: true, create: true, edit: true, remv: true }),
    }));

    await models.PrivilegePermission.deleteMany({ type: { $ne: 1 }, mainMenu: obj.mainMenu, privilege: privilegeId });
    await models.PrivilegePermission.insertMany([obj, ...data]);
  };

  // ---------- Core logic ----------
  if (type === 4) {
    rest = setFieldPermission(rest);
    delete rest.status;
    delete rest.enabled;
    delete rest.id;
    await models.PrivilegePermission.updateMany({ privilege: privilegeId, module: moduleId, enabled: true }, rest);
    return new Response("Status updated", null, 200);
  }

  if (type === 2) {
    rest.mainMenu = rest.id;
    rest.privilege = privilegeId;
    rest.module = moduleId;
    rest.type = 2;
    delete rest.id;
  }
  if (type === 3) {
    rest.mainMenu = payload.menuId;
    rest.subMenu = rest.id;

    rest.privilege = privilegeId;
    rest.module = moduleId;
    rest.type = 3;
    delete rest.id;
  }

  if (existingEntry) {
    if (type === 1) {
      if (fullEnable) {
        if (rest.status) await giveFullAccess();
        else await models.PrivilegePermission.deleteMany({ privilege: privilegeId, module: moduleId });
      } else {
        await models.PrivilegePermission.findOneAndUpdate({ privilege: privilegeId, module: moduleId, type: 1 }, { enabled: rest.status });
      }
    } else if (type === 2 && fullEnable) {
      if (rest.view) await giveFullSubmenu(rest);
      else {
        await models.PrivilegePermission.updateMany(
          { privilege: privilegeId, mainMenu: rest.mainMenu, type: { $ne: 1 } },
          { remv: false, edit: false, create: false, view: false }
        );
      }
    }

    if (type === 3 || (type === 2 && !fullEnable)) {
      rest = setFieldPermission(rest);

      await models.PrivilegePermission.findByIdAndUpdate(existingEntry._id, rest);

      let countSub = await models.SubMenu.countDocuments({ mainMenu: rest.mainMenu });
      let permCount = await models.PrivilegePermission.countDocuments({ type: 3, mainMenu: rest.mainMenu, view: true });
      let enabledCount = await models.PrivilegePermission.countDocuments({ type: 3, mainMenu: rest.mainMenu, enabled: true });

      if (type === 2 && rest.enabled == true && countSub > 0) {
        await giveFullSubmenu(rest, true);
      } else if (type === 2 && rest.enabled == false && countSub > 0) {
        await models.PrivilegePermission.deleteMany({ type: 3, mainMenu: rest.mainMenu, privilege: rest.privilege });
      }

      if (type === 3) {
        delete rest.subMenus;
        rest.type = 2;
        let flag = false;
        rest.enabled = true;

        if (countSub === permCount) {
          flag = true;
        } else if (permCount === 0) {
          flag = true;
          rest.enabled = false;
          rest = setFieldPermission(rest);
          rest.enabled = true;
        } else if (permCount === 1) {
          flag = true;
          rest.view = true;
        }

        if (enabledCount === 0) {
          flag = true;
          rest.enabled = false;
          rest = setFieldPermission(rest);
        }

        if (flag) {
          await models.PrivilegePermission.deleteOne({ type: 2, mainMenu: rest.mainMenu, privilege: rest.privilege });
          await models.PrivilegePermission.create(rest);
        }
      }
    }
  } else {
    // create new
    if (type === 1 && fullEnable) await giveFullAccess();
    else if (type === 1) {
      await models.PrivilegePermission.create({
        type: 1,
        privilege: privilegeId,
        module: rest.id,
        enabled: true,
      });
    } else if (type === 2) {
      fullEnable ? await giveFullSubmenu(rest) : await models.PrivilegePermission.create(setFieldPermission(rest));
    }
  }

  let log = await userActivity({
    req,
    action: "RULE_MODULE_UPDATED",
    description: `Rules Update: - {userName} modified ${privilege?.name} module options`,
    show: false,
    reference: reference,
  });

  return new Response("Status updated", null, 200);
});

async function moduleChange() {
  let privileges = await models.Privilege.find({}, { alloted_modules: 1 }).lean();

  let new_modules = [];
  for (let i = 0; i < privileges.length; i++) {
    let privilege = privileges[i];
    let modules = privilege.alloted_modules;

    if (modules.length > 0) {
      let payload = modules.map((module) => ({ type: 1, privilege: privilege._id, module: module.id, enabled: module.status }));

      new_modules.push(...payload);
    }
  }

  await models.PrivilegePermission.insertMany(new_modules);
  console.log("finished");
}
// moduleChange();

async function mainMenuChange() {
  let privileges = await models.Privilege.find({}, { alloted_main_menus: 1 }).lean();

  let new_main = [];
  for (let i = 0; i < privileges.length; i++) {
    let privilege = privileges[i];
    let mainMenu = privilege.alloted_main_menus;

    if (mainMenu.length > 0) {
      const payload = await Promise.all(
        mainMenu.map(async (main) => {
          const moduleId = await models.MainMenu.findById(main.id);
          return {
            type: 2,
            privilege: privilege._id,
            module: moduleId?.module,
            mainMenu: main.id,
            enabled: main.view || false,
            view: main.view || false,
            create: main.create || false,
            edit: main.edit || false,
            remv: main.remv || false,
          };
        })
      );

      new_main.push(...payload);
    }
  }

  await models.PrivilegePermission.insertMany(new_main);
  console.log("finished");
}
// mainMenuChange()

async function subMenuChange() {
  console.log("processing...");
  let privileges = await models.Privilege.find({}, { alloted_submenus: 1 }).lean();

  let new_main = [];
  for (let i = 0; i < privileges.length; i++) {
    let privilege = privileges[i];
    let subMenu = privilege.alloted_submenus;

    if (subMenu.length > 0) {
      const payload = await Promise.all(
        subMenu.map(async (main) => {
          const subMenu = await models.SubMenu.findById(main.id);
          const moduleId = await models.MainMenu.findById(subMenu?.mainMenu);
          return {
            type: 3,
            privilege: privilege._id,
            module: moduleId?.module,
            mainMenu: subMenu?.mainMenu,
            subMenu: main.id,
            enabled: main.view || false,
            view: main.view || false,
            create: main.create || false,
            edit: main.edit || false,
            remv: main.remv || false,
          };
        })
      );

      new_main.push(...payload);
    }
  }

  await models.PrivilegePermission.insertMany(new_main);
  console.log("finished");
}
// subMenuChange()
