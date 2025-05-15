import { asyncErrorHandler, Response, Error } from "express-error-catcher";
import { checkObjectIdValid, existedValue, paginationValues } from "../helper/functions.js";
import models from "../models/index.js";
import { MenuSchema, SubMenuSchema } from "../utils/validation.yup.js";

export const list = asyncErrorHandler(async (req, res) => {
  let { skip, limit } = paginationValues(req.query);
  let { search, modules } = req.query;
  let condition = { status: 0 };

  if (!isNull(search)) {
    condition.$or = [{ name: { $regex: search, $options: "i" } }, { link: { $regex: search, $options: "i" } }];
  }

  if (!isNull(modules)) {
    condition.module = modules;
  }

  let count = await models.MainMenu.countDocuments(condition);
  let data = await models.MainMenu.find(condition)
    .lean()
    .populate("module", OPTIONS_FIELD)
    .sort({ createdAt: -1 })
    .select("-__v -createdAt -updatedAt -status")
    .skip(skip)
    .limit(limit);
  return new Response("Menus lists", { count, data }, 200);
});

export const add = asyncErrorHandler(async (req, res) => {
  try {
    let payload = existedValue(await MenuSchema(existedValue(req.body), true));

    if (payload?.error) {
      throw new Error(payload.error, 400);
    }

    let isModuleHave = await models.Modules.findOne({
      _id: payload?.module,
      status: 0,
    });

    if (isNull(isModuleHave)) throw new Error("Invalid module provided");

    let userId = req.user?._id;
    let userName = req?.user?.firstName ?? req.user?.username;

    let isAlreadyIn = await models.MainMenu.findOne({
      $or: [{ name: { $regex: new RegExp(`^${payload?.name}$`, "i") } }, { link: { $regex: new RegExp(`^${payload?.link}$`, "i") } }],
      status: 0,
    });

    if (isAlreadyIn && isAlreadyIn.name.toLowerCase() === payload?.name?.toLowerCase()) {
      throw new Error("This name already in use", 400);
    } else if (isAlreadyIn && isAlreadyIn.link.toLowerCase() === payload?.link?.toLowerCase()) {
      throw new Error("This link already in use", 400);
    }

    payload.addedBy = userId;
    await models.MainMenu(payload).save();

    await models
      .UserActivity({
        ip: req.ip,
        action: "New Menu Added",
        user: userName,
        userId: req.user._id,
        description: `A new menu '${payload?.name}' has been added by the '${userName}'`,
      })
      .save();

    return new Response("Menu added successfully", null, 201);
  } catch (error) {
    throw new Error(error.message, error?.statusCode ?? 400);
  }
});

export const update = asyncErrorHandler(async (req, res) => {
  try {
    let id = req.params.id;
    if (!checkObjectIdValid(id)) throw new Error("Invalid menu provided", 400);

    let isValidMenu = await models.MainMenu.findOne({ _id: id, status: 0 });
    if (isNull(isValidMenu)) throw new Error("Invalid menu provided", 400);

    let payload = { link: null, ...(await MenuSchema(req.body, false)) };

    if (payload?.error) {
      throw new Error(payload.error, 400);
    }

    let isModuleHave = await models.Modules.findOne({
      _id: payload?.module,
      status: 0,
    });

    if (isNull(isModuleHave)) throw new Error("Invalid module provided");

    let userName = req?.user?.firstName ?? req.user?.username;

    let isAlreadyIn = await models.MainMenu.findOne({
      _id: { $ne: id },
      $or: [{ name: { $regex: new RegExp(`^${payload?.name}$`, "i") } }, { link: { $regex: new RegExp(`^${payload?.link}$`, "i") } }],
      status: 0,
    });

    if (isAlreadyIn && isAlreadyIn.name.toLowerCase() === payload?.name?.toLowerCase()) {
      throw new Error("This name already in use", 400);
    } else if (isAlreadyIn && isAlreadyIn.link.toLowerCase() === payload?.link?.toLowerCase()) {
      throw new Error("This link already in use", 400);
    }

    await models.MainMenu.findOneAndUpdate({ _id: id, status: 0 }, payload);

    await models
      .UserActivity({
        ip: req.ip,
        action: "Menu Updated",
        user: userName,
        userId: req.user._id,
        description: `A menu '${payload?.name}' has been updated by the '${userName}'`,
      })
      .save();

    return new Response("Menu updated successfully", null, 201);
  } catch (error) {
    throw new Error(error.message, error?.statusCode ?? 400);
  }
});

export const deleteMenu = asyncErrorHandler(async (req, res) => {
  try {
    let id = req.params.id;

    if (!checkObjectIdValid(id)) throw new Error("Invalid menu provided", 400);

    let isValidMenu = await models.MainMenu.findOne({ _id: id, status: 0 });
    if (isNull(isValidMenu)) throw new Error("Invalid menu provided", 400);

    let userName = req?.user?.firstName ?? req.user?.username;

    await models.MainMenu.findOneAndUpdate({ _id: id, status: 0 }, { status: 1 });

    await models
      .UserActivity({
        ip: req.ip,
        action: "Menu Deleted",
        user: userName,
        userId: req.user._id,
        description: `A menu '${isValidMenu?.name}' has been deleted by the '${userName}'`,
      })
      .save();

    return new Response("Menu deleted successfully", null, 201);
  } catch (error) {
    throw new Error(error.message, error?.statusCode ?? 400);
  }
});

//  sub menus handling
export const listSubMenu = asyncErrorHandler(async (req, res) => {
  let { skip, limit } = paginationValues(req.query);

  let { search, menus } = req.query;
  let condition = { status: 0 };

  if (!isNull(search)) {
    condition.$or = [{ name: { $regex: search, $options: "i" } }, { link: { $regex: search, $options: "i" } }];
  }

  if (!isNull(menus)) {
    condition.mainMenu = menus;
  }

  let count = await models.SubMenu.countDocuments(condition);
  let data = await models.SubMenu.find(condition)
    .lean()
    .populate("mainMenu", OPTIONS_FIELD)
    .sort({ createdAt: -1 })
    .select("-__v -createdAt -updatedAt -status")
    .skip(skip)
    .limit(limit);
  return new Response("Sub menu lists", { count, data }, 200);
});

export const addSubMenu = asyncErrorHandler(async (req, res) => {
  try {
    let userId = req.user?._id;
    let userName = req?.user?.firstName ?? req.user?.username;

    let payload = existedValue(await SubMenuSchema(existedValue(req.body)));
    if (payload?.error) {
      throw new Error(payload.error, 400);
    }

    let isValid = await models.MainMenu.findOne({
      _id: payload?.mainMenu,
      status: 0,
    });
    if (isNull(isValid)) throw new Error("Invalid main menu provided");

    let isAlreadyIn = await models.SubMenu.findOne({
      $or: [{ name: { $regex: new RegExp(`^${payload?.name}$`, "i") } }, { link: { $regex: new RegExp(`^${payload?.link}$`, "i") } }],
      status: 0,
    });
    if (isAlreadyIn && isAlreadyIn.name.toLowerCase() === payload?.name?.toLowerCase()) {
      throw new Error("This name already in use", 400);
    } else if (isAlreadyIn && isAlreadyIn.link.toLowerCase() === payload?.link?.toLowerCase()) {
      throw new Error("This link already in use", 400);
    }

    payload.addedBy = userId;
    await models.SubMenu(payload).save();

    await models
      .UserActivity({
        ip: req.ip,
        action: "New Sub Menu Added",
        user: userName,
        userId: req.user._id,
        description: `A new sub menu '${payload?.name}' has been added by the '${userName}'`,
      })
      .save();

    return new Response("Sub Menu added successfully", null, 201);
  } catch (error) {
    throw new Error(error.message, error?.statusCode ?? 400);
  }
});

export const updateSubMenu = asyncErrorHandler(async (req, res) => {
  try {
    let id = req.params.id;
    if (!checkObjectIdValid(id)) throw new Error("Invalid sub menu provided", 400);

    let isValidMenu = await models.SubMenu.findOne({ _id: id, status: 0 });
    if (isNull(isValidMenu)) throw new Error("Invalid sub menu provided", 400);

    let payload = { link: null, ...(await SubMenuSchema(req.body, false)) };

    if (payload?.error) {
      throw new Error(payload.error, 400);
    }

    let isValid = await models.MainMenu.findOne({
      _id: payload?.mainMenu,
      status: 0,
    });

    if (isNull(isValid)) throw new Error("Invalid main menu provided");

    let userName = req?.user?.firstName ?? req.user?.username;

    let isAlreadyIn = await models.SubMenu.findOne({
      _id: { $ne: id },
      $or: [{ name: { $regex: new RegExp(`^${payload?.name}$`, "i") } }, { link: { $regex: new RegExp(`^${payload?.link}$`, "i") } }],
      status: 0,
    });
    if (isAlreadyIn && isAlreadyIn.name.toLowerCase() === payload?.name?.toLowerCase()) {
      throw new Error("This name already in use", 400);
    } else if (isAlreadyIn && isAlreadyIn.link.toLowerCase() === payload?.link?.toLowerCase()) {
      throw new Error("This link already in use", 400);
    }

    await models.SubMenu.findOneAndUpdate({ _id: id, status: 0 }, payload);

    await models
      .UserActivity({
        ip: req.ip,
        action: "Sub Menu Updated",
        user: userName,
        userId: req.user._id,
        description: `A sub menu '${payload?.name}' has been updated by the '${userName}'`,
      })
      .save();

    return new Response("Sub menu updated successfully", null, 201);
  } catch (error) {
    throw new Error(error.message, error?.statusCode ?? 400);
  }
});

export const deleteSubMenu = asyncErrorHandler(async (req, res) => {
  try {
    let id = req.params.id;

    if (!checkObjectIdValid(id)) throw new Error("Invalid sub menu provided", 400);

    let isValidMenu = await models.SubMenu.findOne({ _id: id, status: 0 });
    if (isNull(isValidMenu)) throw new Error("Invalid sub menu provided", 400);

    let userName = req?.user?.firstName ?? req.user?.username;

    await models.SubMenu.findOneAndUpdate({ _id: id, status: 0 }, { status: 1 });

    await models
      .UserActivity({
        ip: req.ip,
        action: "Sub Menu Deleted",
        user: userName,
        userId: req.user._id,
        description: `A sub menu '${isValidMenu?.name}' has been deleted by the '${userName}'`,
      })
      .save();

    return new Response("Sub Menu deleted successfully", null, 201);
  } catch (error) {
    throw new Error(error.message, error?.statusCode ?? 400);
  }
});
