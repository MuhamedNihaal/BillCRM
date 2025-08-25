import { asyncErrorHandler, Response, Error } from "express-error-catcher";
import models from "../models/index.js";

export const module = asyncErrorHandler(async (req) => {
  let data = await models.Modules.find({ status: 0 }, OPTIONS_FIELD);
  return new Response(null, { data }, 200);
});

export const menu = asyncErrorHandler(async (req) => {
  let data = await models.MainMenu.find({ status: 0 }, OPTIONS_FIELD);
  return new Response(null, { data }, 200);
});

export const subMenu = asyncErrorHandler(async (req) => {
  let data = await models.SubMenu.find({ status: 0 }, OPTIONS_FIELD);
  return new Response(null, { data }, 200);
});

export const privilege = asyncErrorHandler(async (req) => {
  let data = await models.Privilege.find({ status: 0, superAdmin: false }, OPTIONS_FIELD);
  return new Response(null, { data }, 200);
});

export const countries = asyncErrorHandler(async () => {
  const data = await models.Country.find({}, Object.freeze({ name: "$name", label: "$name", value: "$_id", _id: "$id" }))
    .lean()
    .sort({ name: 1 });
  return new Response(null, { data }, 200);
});

export const states = asyncErrorHandler(async (req) => {
  const condition = { countryId: 101 };

  if (req.query.country) condition.countryId = req.query.country;

  const data = await models.State.find(condition, OPTIONS_FIELD).lean().sort({ name: 1 });

  return new Response(null, { data }, 200);
});

export const districts = asyncErrorHandler(async (req) => {
  const condition = { status: 0 };
  const { state } = req.query;

  if (!isNull(state)) {
    if (Array.isArray(state)) {
      condition.state = { $in: state };
    } else condition.state = state;
  }

  const data = await models.District.find(condition, OPTIONS_FIELD).lean().sort({ name: 1 });

  return new Response(null, { data }, 200);
});

export const branch = asyncErrorHandler(async (req) => {
  const { company, type } = req.query;
  if (isNull(type)) throw new Error("Branch type required");

  let condition = { status: 0, type: Number(type) };

  if (type == -1) {
    delete condition.type;
  }

  if (!isNull(company)) condition.company = company;

  const data = await models.Branch.find(condition, OPTIONS_FIELD).lean().sort({ name: 1 });

  return new Response(null, { data }, 200);
});

export const user = asyncErrorHandler(async (req) => {
  let { type } = req.query;
  let condition = { status: 0 };
  if (type == "1") {
    condition = {};
  }

  let data = await models.User.find(condition, OPTIONS_FIELD);
  return new Response(null, { data }, 200);
});

export const company = asyncErrorHandler(async (req) => {
  const condition = { status: 0 };

  const data = await models.Company.find(condition, OPTIONS_FIELD).sort({
    name: 1,
  });

  return new Response("Success", { data }, 200);
});
