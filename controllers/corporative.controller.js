import { asyncErrorHandler, Response, Error } from "express-error-catcher";
import { checkObjectIdValid, paginationValues } from "../helper/functions.js";
import models from "../models/index.js"
import { CorporativeSchema } from "../utils/validation/corporative.validation.js"

export const listCorporative = asyncErrorHandler(async (req, res) => {
    let { search, skip, limit } = paginationValues(req.query);

    let condition = { status: 0 };
    if (!isNull(search)) {
        condition.name = { $regex: search, $options: "i" };
    }
    let count = await models.Corporative.countDocuments(condition);
    let data = await models.Corporative.find(condition)
        .lean()
        .populate("state", OPTIONS_FIELD)
        .populate("district", OPTIONS_FIELD)
        .populate("addedBy", "firstName lastName username")
        .populate("updatedBy", "firstName lastName username")
        .sort({ createdAt: -1 })
        .select("-__v -createdAt -updatedAt -status")
        .skip(skip)
        .limit(limit);
    return new Response(null, { count, data }, 200);
});

export const addCorporative = asyncErrorHandler(async (req, res) => {
    let userId = req.user?._id;
    let payload = await CorporativeSchema(req.body, true);

    if (payload?.error) throw new Error(payload.error, 400);
    delete payload.error;

    let { mobile } = payload;

    let isMobileAlready = await models.Corporative.findOne({ mobile, status: 0 });
    if (isMobileAlready) {
        throw new Error("This mobile number already in use", 400);
    }

    payload.addedBy = userId;
    await models.Corporative(payload).save();

    return new Response("Successfully Corporative added", null, 201);
});

export const updateCorporative = asyncErrorHandler(async (req, res) => {
    let userId = req.user?._id;
    let id = req.params.id;
    if (!checkObjectIdValid(id)) throw new Error("invalid id provided", 400);
    let isValidId = await models.Corporative.findOne({ _id: id, status: 0 });
    if (!isValidId) {
        throw new Error("invalid id provided", 400);
    }

    let payload = {
        location: null,
        district: null,
        state: null,
        ...(await CorporativeSchema(req.body, true)),
    };

    if (payload?.error) throw new Error(payload.error, 400);
    delete payload.error;

    let { mobile } = payload;

    let isMobileAlready = await models.Corporative.findOne({ mobile, status: 0 });

    if (isMobileAlready && payload?.mobile != isValidId?.mobile) {
        throw new Error("this mobile number already in use", 400);
    }

    payload.updatedBy = userId;
    await models.Corporative.findOneAndUpdate({ _id: id, status: 0 }, payload);
    return new Response("Successfully Corporative updated", null, 200);
});

export const removeCorporative = asyncErrorHandler(async (req) => {
    let userId = req.user?._id;
    let id = req.params.id;
    if (!checkObjectIdValid(id)) throw new Error("invalid id provided", 400);

    await models.Corporative.findOneAndUpdate(
        { _id: id, status: 0 },
        { status: 1, updatedBy: userId }
    );
    return new Response("Successfully Corporative removed", null, 200);
});