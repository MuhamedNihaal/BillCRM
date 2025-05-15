import { asyncErrorHandler, Error, Response } from "express-error-catcher";
import models from "../models/index.js";
import _ from "lodash";

export const relationships = asyncErrorHandler(async (req, res) => {
  let name = _.capitalize(_.toLower(req.body.name));

  let existdata = await models.Relation.findOne({ name: name, status: 0 });
  if (existdata) throw new Error("This relation already exist.", 400);

  await models.Relation.create({ ip: req.ip, name: name });

  return new Response("Created successfully", null, 200);
});
