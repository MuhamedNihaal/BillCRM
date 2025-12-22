import models from "@/models/index.js";
import { querySearchSanitize } from "@/helper/index.js";
import { asyncErrorHandler, Response, Error } from "express-error-catcher";

export const listHead = asyncErrorHandler(async (req) => {
  let { search } = req.query;
  const condition = { status: 0 };

  if (!isNull(search)) {
    search = querySearchSanitize(search);
    condition.name = { $regex: search, $options: "i" };
  }

  const data = await models.AccountHead.find(condition, "date time name").sort({ _id: -1 });

  return new Response(null, { data }, 200);
});

export const ListSubHead = asyncErrorHandler(async (req) => {
  let { search } = req.query;
  let { head } = req.query;
  const condition = { status: 0 };

  if (!isNull(search)) {
    search = querySearchSanitize(search);
    condition.name = { $regex: search, $options: "i" };
  }
  if (!isNull(head)) condition.head = head;

  const data = await models.AccountSubHead.find(condition, "date time name head")
    .populate("head", OPTIONS_FIELD)
    .populate("addedBy", USER_BY)
    .sort({ createdAt: -1 });

  return new Response("Success", { data }, 200);
});
