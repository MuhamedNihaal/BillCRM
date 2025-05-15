import { asyncErrorHandler, Response, Error } from "express-error-catcher";
import moment from "moment";
import { checkObjectIdValid, existedValue, paginationValues, validateSpaceAndLetters } from "../helper/functions.js";
import models from "../models/index.js";
import { DoctorSchema, HospitalSchema } from "../utils/validation.yup.js";
import { consumableSchema, methodsSchema, sampleDataSchema, sampleSchema } from "../utils/validation/manage.validation.js";

// handling units
export const listUnit = asyncErrorHandler(async (req, res) => {
  let { skip, limit } = paginationValues(req.query);
  let { search } = req.query;

  let condition = { status: 0 };

  if (!isNull(search)) {
    condition.name = { $regex: search, $options: "i" };
  }

  let count = await models.Units.countDocuments(condition);
  let data = await models.Units.find(condition)
    .lean()
    .populate("addedBy", "firstName lastName username")
    .populate("updatedBy", "firstName lastName username")
    .sort({ createdAt: -1 })
    .select("-__v -createdAt -updatedAt -status")
    .skip(skip)
    .limit(limit);
  return new Response("Unit lists", { count, data }, 200);
});

export const addUnits = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { name } = req.body;

  let validName = validateSpaceAndLetters(name);

  let isAlreadyUsed = await models.Units.findOne({
    name: { $regex: new RegExp(`^${validName}$`, "i") },
    status: 0,
  });

  if (isAlreadyUsed) throw new Error("This name already in use", 400);

  await models.Units({ name: validName, addedBy: userId }).save();

  return new Response("Units added successfully", null, 201);
});

export const updateUnits = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { id } = req.params;

  if (!checkObjectIdValid(id)) throw new Error("Invalid units", 400);
  let isValidId = await models.Units.findOne({
    _id: id,
    status: 0,
  });
  if (!isValidId) throw new Error("Invalid units", 400);

  let { name } = req.body;

  let validName = validateSpaceAndLetters(name);

  let isAlreadyUsed = await models.Units.findOne({
    _id: { $ne: id },
    name: { $regex: new RegExp(`^${validName}$`, "i") },
    status: 0,
  });

  if (isAlreadyUsed) throw new Error("This name already in use", 400);

  await models.Units.findOneAndUpdate({ _id: id, status: 0 }, { name: validName, updatedBy: userId });
  return new Response("Units updated Successfully", null, 200);
});

export const removeUnits = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid units", 400);

  await models.Units.findOneAndUpdate({ _id: id, status: 0 }, { status: 1, updatedBy: userId });
  return new Response("Units removed successfully", null, 200);
});

//  methods handling
export const listMethods = asyncErrorHandler(async (req, res) => {
  let { skip, limit } = paginationValues(req.query);
  let { search } = req.query;

  let condition = { status: 0 };

  if (!isNull(search)) {
    condition.name = { $regex: search, $options: "i" };
  }

  let count = await models.Methods.countDocuments(condition);
  let data = await models.Methods.find(condition)
    .lean()
    .populate("addedBy", "firstName lastName username")
    .populate("updatedBy", "firstName lastName username")
    .sort({ createdAt: -1 })
    .select("-__v -createdAt -updatedAt -status")
    .skip(skip)
    .limit(limit);
  return new Response("Method lists", { count, data }, 200);
});

export const addMethods = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let payload = await methodsSchema(req.body);

  if (payload.error) {
    throw new Error(payload.error, 400);
  }

  let isAlreadyUsed = await models.Methods.findOne({
    name: { $regex: new RegExp(`^${payload.name}$`, "i") },
    status: 0,
  });

  if (isAlreadyUsed) throw new Error("This name already in use", 400);

  payload.addedBy = userId;
  await models.Methods(payload).save();

  return new Response("Methods added successfully", null, 201);
});

export const updateMethods = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid Method", 400);
  let isValidId = await models.Methods.findOne({
    _id: id,
    status: 0,
  });
  if (!isValidId) {
    throw new Error("Invalid Method", 400);
  }

  let payload = await methodsSchema(req.body);

  if (payload.error) {
    throw new Error(payload.error, 400);
  }

  let isAlreadyUsed = await models.Methods.findOne({
    _id: { $ne: id },
    name: { $regex: new RegExp(`^${payload.name}$`, "i") },
    status: 0,
  });

  if (isAlreadyUsed) throw new Error("This name already in use", 400);

  payload.updatedBy = userId;
  await models.Methods.findOneAndUpdate({ _id: id, status: 0 }, payload);
  return new Response("Methods updated successfully", null, 200);
});

export const removeMethods = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid method", 400);

  await models.Methods.findOneAndUpdate({ _id: id, status: 0 }, { status: 1, updatedBy: userId });
  return new Response("Methods removed successfully", null, 200);
});

// doctors handling
export const listDoctors = asyncErrorHandler(async (req, res) => {
  let { skip, limit } = paginationValues(req.query);
  let { search } = req.query;

  let condition = { status: 0 };

  if (!isNull(search)) {
    condition.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { mobile: { $regex: search, $options: "i" } },
    ];
  }

  let count = await models.Doctors.countDocuments(condition);
  let data = await models.Doctors.find(condition)
    .lean()
    .populate("hospital", OPTIONS_FIELD)
    .populate("addedBy", "firstName lastName username")
    .populate("updatedBy", "firstName lastName username")
    .sort({ createdAt: -1 })
    .select("-__v -createdAt -updatedAt -status")
    .skip(skip)
    .limit(limit);
  return new Response("Doctor lists", { count, data }, 200);
});

export const addDoctors = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let payload = await DoctorSchema(req.body, true);

  if (payload?.error) throw new Error(payload.error, 400);
  delete payload.error;

  let { mobile } = payload;

  let isMobileAlready = await models.Doctors.findOne({ mobile, status: 0 });
  if (isMobileAlready) {
    throw new Error("This mobile number already in use", 400);
  }

  payload.addedBy = userId;
  await models.Doctors(payload).save();

  return new Response("Doctor added successfully", null, 201);
});

export const updateDoctors = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid doctor provided", 400);
  let isValidId = await models.Doctors.findOne({ _id: id, status: 0 });
  if (!isValidId) {
    throw new Error("Invalid doctor provided", 400);
  }

  let payload = existedValue(await DoctorSchema(req.body, false));

  if (payload?.error) throw new Error(payload.error, 400);

  let { mobile } = payload;

  let isMobileAlready = await models.Doctors.findOne({ _id: { $ne: id }, mobile, status: 0 });
  if (isMobileAlready) {
    throw new Error("This mobile number already in use", 400);
  }

  payload.updatedBy = userId;
  await models.Doctors.findOneAndUpdate({ _id: id, status: 0 }, payload);
  return new Response("Doctor updated successfully", null, 200);
});

export const removeDoctors = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid doctor provided", 400);

  await models.Doctors.findOneAndUpdate({ _id: id, status: 0 }, { status: 1, updatedBy: userId });
  return new Response("Doctor removed successfully", null, 200);
});

// hospital handling
export const listHospital = asyncErrorHandler(async (req, res) => {
  let { skip, limit } = paginationValues(req.query);
  let { search } = req.query;
  let condition = { status: 0 };
  if (!isNull(search)) {
    condition.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { mobile: { $regex: search, $options: "i" } },
    ];
  }

  let count = await models.Hospital.countDocuments(condition);
  let data = await models.Hospital.find(condition)
    .lean()
    .populate("state", OPTIONS_FIELD)
    .populate("district", OPTIONS_FIELD)
    .populate("addedBy", "firstName lastName username")
    .populate("updatedBy", "firstName lastName username")
    .sort({ createdAt: -1 })
    .select("-__v -createdAt -updatedAt -status")
    .skip(skip)
    .limit(limit);
  return new Response("Hospital lists", { count, data }, 200);
});

export const addHospital = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let payload = await HospitalSchema(req.body, true);

  if (payload?.error) throw new Error(payload.error, 400);
  delete payload.error;

  let { mobile } = payload;

  let isMobileAlready = await models.Hospital.findOne({ mobile, status: 0 });
  if (isMobileAlready) {
    throw new Error("This mobile number already in use", 400);
  }

  payload.addedBy = userId;
  await models.Hospital(payload).save();

  return new Response("Hospital added successfully", null, 201);
});

export const updateHospital = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid hospital provided", 400);
  let isValidId = await models.Hospital.findOne({ _id: id, status: 0 });
  if (!isValidId) {
    throw new Error("Invalid hospital provided", 400);
  }

  let payload = {
    location: null,
    district: null,
    state: null,
    ...(await HospitalSchema(req.body, true)),
  };

  if (payload?.error) throw new Error(payload.error, 400);

  let { mobile } = payload;

  let isMobileAlready = await models.Hospital.findOne({ _id: { $ne: id }, mobile, status: 0 });

  if (isMobileAlready) {
    throw new Error("This mobile number already in use", 400);
  }

  payload.updatedBy = userId;
  await models.Hospital.findOneAndUpdate({ _id: id, status: 0 }, payload);
  return new Response("Hospital updated successfully", null, 200);
});

export const removeHospital = asyncErrorHandler(async (req) => {
  let userId = req.user?._id;
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid hospital provided", 400);

  await models.Hospital.findOneAndUpdate({ _id: id, status: 0 }, { status: 1, updatedBy: userId });
  return new Response("Hospital removed successfully", null, 200);
});

// labs handling
export const listLab = asyncErrorHandler(async (req, res) => {
  let { skip, limit } = paginationValues(req.query);
  let { search } = req.query;

  let condition = { status: 0 };

  if (!isNull(search)) {
    condition.$or = [
      { name: { $regex: search, $options: "i" } },
      { email: { $regex: search, $options: "i" } },
      { mobile: { $regex: search, $options: "i" } },
    ];
  }

  let count = await models.Lab.countDocuments(condition);
  let data = await models.Lab.find(condition)
    .lean()
    .populate("state", OPTIONS_FIELD)
    .populate("district", OPTIONS_FIELD)
    .populate("addedBy", "firstName lastName username")
    .populate("updatedBy", "firstName lastName username")
    .sort({ createdAt: -1 })
    .select("-__v -createdAt -updatedAt -status")
    .skip(skip)
    .limit(limit);
  return new Response("Lab lists", { count, data }, 200);
});

export const addLab = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let payload = await HospitalSchema(req.body, true);

  if (payload?.error) throw new Error(payload.error, 400);

  let { mobile } = payload;

  let isMobileAlready = await models.Lab.findOne({ mobile, status: 0 });
  if (isMobileAlready) {
    throw new Error("This mobile number already in use", 400);
  }

  payload.addedBy = userId;
  await models.Lab(payload).save();

  return new Response("Lab added successfully", null, 201);
});

export const updateLab = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid lab provided", 400);
  let isValidId = await models.Lab.findOne({ _id: id, status: 0 });
  if (!isValidId) {
    throw new Error("invalid lab provided", 400);
  }

  let payload = {
    location: null,
    district: null,
    state: null,
    ...(await HospitalSchema(req.body, true)),
  };

  if (payload?.error) throw new Error(payload.error, 400);

  let { mobile } = payload;

  let isMobileAlready = await models.Lab.findOne({ _id: { $ne: id }, mobile, status: 0 });
  if (isMobileAlready) {
    throw new Error("This mobile number already in use", 400);
  }

  payload.updatedBy = userId;
  await models.Lab.findOneAndUpdate({ _id: id, status: 0 }, payload);
  return new Response("Lab updated successfully", null, 200);
});

export const removeLab = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid lab provided", 400);

  await models.Lab.findOneAndUpdate({ _id: id, status: 0 }, { status: 1, updatedBy: userId });
  return new Response("Lab removed successfully", null, 200);
});

// antibiotics handling
export const listAntibiotics = asyncErrorHandler(async (req, res) => {
  let { skip, limit } = paginationValues(req.query);
  let { search } = req.query;

  let condition = { status: 0 };

  if (!isNull(search)) {
    condition.name = { $regex: search, $options: "i" };
  }

  let count = await models.Antibiotics.countDocuments(condition);
  let data = await models.Antibiotics.find(condition)
    .lean()
    .populate("addedBy", "firstName lastName username")
    .populate("updatedBy", "firstName lastName username")
    .sort({ createdAt: -1 })
    .select("-__v -createdAt -updatedAt -status")
    .skip(skip)
    .limit(limit);

  return new Response("Antibiotic lists", { count, data }, 200);
});

export const addAntibiotics = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;

  let { name } = req.body;
  let validName = validateSpaceAndLetters(name);

  let isValidName = await models.Antibiotics.findOne({
    name: { $regex: new RegExp(`^${validName}$`, "i") },
    status: 0,
  });
  if (isValidName) {
    throw new Error("This name already in use", 400);
  }

  await models.Antibiotics({ name: validName, addedBy: userId }).save();

  return new Response("Antibiotics added successfully", null, 201);
});

export const updateAntibiotics = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid antibiotics provided", 400);
  let isValidId = await models.Antibiotics.findOne({
    _id: id,
    status: 0,
  });
  if (!isValidId) {
    throw new Error("Invalid antibiotics provided", 400);
  }

  let { name } = req.body;
  let validName = validateSpaceAndLetters(name);
  let isValidName = await models.Antibiotics.findOne({
    _id: { $ne: id },
    name: { $regex: new RegExp(`^${validName}$`, "i") },
    status: 0,
  });
  if (isValidName) {
    throw new Error("This name already in use", 400);
  }

  await models.Antibiotics.findOneAndUpdate({ _id: id, status: 0 }, { name: validName, updatedBy: userId });
  return new Response("Antibiotics updated successfully", null, 200);
});

export const removeAntibiotics = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid antibiotics provided", 400);

  await models.Antibiotics.findOneAndUpdate({ _id: id, status: 0 }, { status: 1, updatedBy: userId });

  return new Response("Antibiotics removed successfully", null, 200);
});

// analysis type handling
export const listAnalysisType = asyncErrorHandler(async (req, res) => {
  let { skip, limit } = paginationValues(req.query);
  let { search } = req.query;

  let condition = { status: 0 };

  if (!isNull(search)) {
    condition.name = { $regex: search, $options: "i" };
  }

  let count = await models.AnalysisType.countDocuments(condition);
  let data = await models.AnalysisType.find(condition)
    .lean()
    .populate("addedBy", "firstName lastName username")
    .populate("updatedBy", "firstName lastName username")
    .sort({ createdAt: -1 })
    .select("-__v -createdAt -updatedAt -status")
    .skip(skip)
    .limit(limit);

  return new Response("Analysis lists", { count, data }, 200);
});

export const addAnalysisType = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;

  let { name } = req.body;
  let validName = validateSpaceAndLetters(name);

  let isValidName = await models.AnalysisType.findOne({
    name: { $regex: new RegExp(`^${validName}$`, "i") },
    status: 0,
  });
  if (isValidName) {
    throw new Error("This name already in use", 400);
  }

  await models.AnalysisType({ name: validName, addedBy: userId }).save();

  return new Response("Analysis type added successfully", null, 201);
});

export const updateAnalysisType = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid analysis type provided", 400);
  let isValidId = await models.AnalysisType.findOne({
    _id: id,
    status: 0,
  });
  if (!isValidId) {
    throw new Error("Invalid analysis type provided", 400);
  }

  let { name } = req.body;
  let validName = validateSpaceAndLetters(name);
  let isValidName = await models.AnalysisType.findOne({
    _id: { $ne: id },
    name: { $regex: new RegExp(`^${validName}$`, "i") },
    status: 0,
  });
  if (isValidName) {
    throw new Error("This name already in use", 400);
  }

  await models.AnalysisType.findOneAndUpdate({ _id: id, status: 0 }, { name: validName, updatedBy: userId });
  return new Response("Analysis type updated successfully", null, 200);
});

export const removeAnalysisType = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid analysis type provided", 400);

  await models.AnalysisType.findOneAndUpdate({ _id: id, status: 0 }, { status: 1, updatedBy: userId });

  return new Response("Analysis type removed successfully", null, 200);
});

// consumable category handling
export const listConsumableCategory = asyncErrorHandler(async (req, res) => {
  let { skip, limit } = paginationValues(req.query);
  let { search } = req.query;

  let condition = { status: 0 };

  if (!isNull(search)) {
    condition.name = { $regex: search, $options: "i" };
  }

  let count = await models.ConsumableCategory.countDocuments(condition);
  let data = await models.ConsumableCategory.find(condition)
    .lean()
    .populate("addedBy", "firstName lastName username")
    .populate("updatedBy", "firstName lastName username")
    .sort({ createdAt: -1 })
    .select("-__v -createdAt -updatedAt -status")
    .skip(skip)
    .limit(limit);

  return new Response("Consumable category lists", { count, data }, 200);
});

export const addConsumableCategory = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;

  let { name } = req.body;
  let validName = validateSpaceAndLetters(name);
  let isValidName = await models.ConsumableCategory.findOne({
    name: { $regex: new RegExp(`^${validName}$`, "i") },
    status: 0,
  });
  if (isValidName) {
    throw new Error("This value already in use", 400);
  }

  await models.ConsumableCategory({ name: validName, addedBy: userId }).save();

  return new Response("Consumable category added successfully", null, 201);
});

export const updateConsumableCategory = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid consumable category provided", 400);
  let isValidId = await models.ConsumableCategory.findOne({
    _id: id,
    status: 0,
  });

  if (!isValidId) {
    throw new Error("Invalid consumable category provided", 400);
  }

  let { name } = req.body;
  let validName = validateSpaceAndLetters(name);
  let isValidName = await models.ConsumableCategory.findOne({
    _id: { $ne: id },
    name: { $regex: new RegExp(`^${validName}$`, "i") },
    status: 0,
  });

  if (isValidName) {
    throw new Error("This name already in use", 400);
  }

  await models.ConsumableCategory.findOneAndUpdate({ _id: id, status: 0 }, { name: validName, updatedBy: userId });
  return new Response("Consumable category updated successfully", null, 200);
});

export const removeConsumableCategory = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid consumable category provided", 400);

  await models.ConsumableCategory.findOneAndUpdate({ _id: id, status: 0 }, { status: 1, updatedBy: userId });

  return new Response("Consumable category removed successfully", null, 200);
});

// consumable handling
export const listConsumable = asyncErrorHandler(async (req, res) => {
  let { skip, limit } = paginationValues(req.query);
  let { search, category } = req.query;

  let condition = { status: 0 };

  if (!isNull(search)) {
    condition.$or = [{ name: { $regex: search, $options: "i" } }, { code: { $regex: search, $options: "i" } }];
  }

  if (!isNull(category)) {
    condition.category = category;
  }

  let count = await models.Consumable.countDocuments(condition);
  let data = await models.Consumable.find(condition)
    .lean()
    .populate("addedBy", "firstName lastName username")
    .populate("updatedBy", "firstName lastName username")
    .populate("category", OPTIONS_FIELD)
    .sort({ createdAt: -1 })
    .select("-__v -createdAt -updatedAt -status")
    .skip(skip)
    .limit(limit);
  return new Response("Consumable lists", { count, data }, 200);
});

export const addConsumable = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;

  let payload = await consumableSchema(req.body);

  if (payload.error) {
    throw new Error(payload.error, 400);
  }

  let isValidName = await models.Consumable.findOne({
    $or: [{ name: { $regex: new RegExp(`^${payload.name}$`, "i") } }, { code: { $regex: new RegExp(`^${payload.code}$`, "i") } }],
    status: 0,
  });

  if (isValidName && isValidName.name.toLowerCase() === payload.name.toLowerCase()) {
    throw new Error("This name already in use", 400);
  } else if (isValidName && isValidName.code.toLowerCase() === payload.code.toLowerCase()) {
    throw new Error("This code already in use", 400);
  }

  let isValidCategory = await models.ConsumableCategory.findOne({
    _id: payload.category,
    status: 0,
  });

  if (isNull(isValidCategory)) {
    throw new Error("Invalid category provided", 400);
  }

  payload.addedBy = userId;
  await models.Consumable(payload).save();

  return new Response("Consumable added successfully", null, 201);
});

export const updateConsumable = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid consumable provided", 400);

  let isValidId = await models.Consumable.findOne({
    _id: id,
    status: 0,
  });
  if (!isValidId) throw new Error("Invalid consumable provided", 400);

  let payload = await consumableSchema(req.body, false);

  if (payload?.error) {
    throw new Error(payload.error, 400);
  }

  let isValidName = await models.Consumable.findOne({
    _id: { $ne: id },
    $or: [{ name: { $regex: new RegExp(`^${payload.name}$`, "i") } }, { code: { $regex: new RegExp(`^${payload.code}$`, "i") } }],
    status: 0,
  });

  if (isValidName && isValidName.name.toLowerCase() === payload.name.toLowerCase()) {
    throw new Error("This name already in use", 400);
  } else if (isValidName && isValidName.code.toLowerCase() === payload.code.toLowerCase()) {
    throw new Error("This code already in use", 400);
  }

  let isValidCategory = await models.ConsumableCategory.findOne({
    _id: payload.category,
    status: 0,
  });
  if (isNull(isValidCategory)) {
    throw new Error("Invalid category category provided", 400);
  }

  payload.updatedBy = userId;
  await models.Consumable.findOneAndUpdate({ _id: id, status: 0 }, payload);
  return new Response("Consumable updated successfully", null, 200);
});

export const removeConsumable = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid consumable provided", 400);

  await models.Consumable.findOneAndUpdate({ _id: id, status: 0 }, { status: 1, updatedBy: userId });

  return new Response("Consumable removed successfully", null, 200);
});

// range type handling
export const listRangeType = asyncErrorHandler(async (req, res) => {
  let { skip, limit } = paginationValues(req.query);
  let { search } = req.query;

  let condition = { status: 0 };

  if (!isNull(search)) {
    condition.name = { $regex: search, $options: "i" };
  }

  let count = await models.RangeType.countDocuments(condition);
  let data = await models.RangeType.find(condition)
    .lean()
    .populate("addedBy", "firstName lastName username")
    .populate("updatedBy", "firstName lastName username")
    .sort({ createdAt: -1 })
    .select("-__v -createdAt -updatedAt -status")
    .skip(skip)
    .limit(limit);

  return new Response("Range type lists", { count, data }, 200);
});

export const addRangeType = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;

  let { name } = req.body;
  let validName = validateSpaceAndLetters(name, "name", true);

  let isValidName = await models.RangeType.findOne({
    name: { $regex: new RegExp(`^${validName}$`, "i") },
    status: 0,
  });

  if (isValidName) {
    throw new Error("This name already in use", 400);
  }

  await models.RangeType({ name: validName, addedBy: userId }).save();

  return new Response("Range type added successfully", null, 201);
});

export const updateRangeType = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid range type provided", 400);
  let isValidId = await models.RangeType.findOne({
    _id: id,
    status: 0,
  });
  if (!isValidId) throw new Error("Invalid range type provided", 400);

  let { name } = req.body;
  let validName = validateSpaceAndLetters(name, "name", true);

  let isValidName = await models.RangeType.findOne({
    _id: { $ne: id },
    name: { $regex: new RegExp(`^${validName}$`, "i") },
    status: 0,
  });

  if (isValidName) {
    throw new Error("This name already in use", 400);
  }

  await models.RangeType.findOneAndUpdate({ _id: id, status: 0 }, { name: validName, updatedBy: userId });
  return new Response("Range type updated successfully", null, 200);
});

export const removeRangeType = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid range type provided", 400);

  await models.RangeType.findOneAndUpdate({ _id: id, status: 0 }, { status: 1, updatedBy: userId });

  return new Response("Range type removed successfully", null, 200);
});

export const listSample = asyncErrorHandler(async (req, res) => {
  let { skip, limit } = paginationValues(req.query);
  let { search, type } = req.query;

  let condition = { status: 0 };

  if (!isNull(search)) {
    condition.name = { $regex: search, $options: "i" };
  }

  if ([1, 2, "1", "2"].includes(type)) {
    condition.type = Number(type);
  }

  let count = await models.Sample.countDocuments(condition);
  let data = await models.Sample.find(condition)
    .populate("examination", {
      label: { $concat: ["$name", " (EXAMINATION)"] },
      value: "$_id",
      name: "$name",
    })
    .populate("culture", {
      label: { $concat: ["$name", " (CULTURE)"] },
      value: "$_id",
      name: "$name",
    })
    .populate("data", OPTIONS_FIELD)
    .populate("addedBy", OPTIONS_FIELD)
    .sort({ createdAt: -1 })
    .select("-__v -createdAt -updatedAt -status")
    .skip(skip)
    .limit(limit);

  return new Response("Sample List", { count, data }, 200);
});

export const addSample = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;

  const payload = await sampleSchema(req.body);

  if (payload.error) {
    throw new Error(payload.error, 400);
  }

  let isValidName = await models.Sample.findOne({
    type: payload?.type,
    name: { $regex: new RegExp(`^${payload.name}$`, "i") },
    status: 0,
  });

  if (isValidName) {
    throw new Error("This name is already in use for this type", 400);
  }

  if (payload.type === 1) {
    let isValidExamination = await models.Test.findOne({ status: 0, _id: payload.id });

    if (!isValidExamination) {
      throw new Error("Invalid examination", 400);
    }

    payload.examination = payload.id;
    delete payload?.id;
  }

  if (payload.type === 2) {
    let isValidCulture = await models.Test.findOne({ status: 0, _id: payload.id });

    if (!isValidCulture) {
      throw new Error("Invalid culture", 400);
    }
    payload.culture = payload.id;
    delete payload?.id;
  }

  payload.addedBy = userId;

  await models.Sample(payload).save();

  return new Response("Sample added successfully", null, 201);
});

export const updateSample = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid sample provided", 400);
  let isValidId = await models.Sample.findOne({
    _id: id,
    status: 0,
  });
  if (!isValidId) {
    throw new Error("Invalid sample provided", 400);
  }

  let payload = await sampleSchema(req.body);

  let isValidName = await models.Sample.findOne({
    _id: { $ne: id },
    type: payload?.type,
    name: { $regex: new RegExp(`^${payload.name}$`, "i") },
    status: 0,
  });
  if (isValidName) {
    throw new Error("This name is already in use for this type");
  }

  if (payload.type === 1) {
    payload.examination = payload.id;
    delete payload?.id;
  }

  if (payload.type === 2) {
    payload.culture = payload.id;
    delete payload?.id;
  }

  payload.updatedBy = userId;
  await models.Sample.findOneAndUpdate({ _id: id, status: 0 }, payload);

  return new Response("Sample Updated successfully", null, 200);
});

export const removeSample = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid sample provided", 400);

  await models.Sample.findOneAndUpdate({ _id: id, status: 0 }, { status: 1, updatedBy: userId });

  return new Response("Sample removed successfully", null, 200);
});

export const listDepartments = asyncErrorHandler(async (req, res) => {
  let { skip, limit } = paginationValues(req.query);
  let { search } = req.query;

  let condition = { status: 0 };

  if (!isNull(search)) {
    condition.$or = [{ name: { $regex: search, $options: "i" } }, { code: { $regex: search, $options: "i" } }];
  }

  let count = await models.Department.countDocuments(condition);
  let data = await models.Department.find(condition)
    .lean()
    .populate("addedBy", "firstName lastName username")
    .populate("updatedBy", "firstName lastName username")
    .sort({ createdAt: -1 })
    .select("-__v -createdAt -updatedAt -status")
    .skip(skip)
    .limit(limit);

  return new Response("Department lists", { count, data }, 200);
});

export const addDepartment = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;

  let { name, code } = req.body;
  let validName = validateSpaceAndLetters(name, "Name", true);
  let validCode = validateSpaceAndLetters(code, "Code", true);

  let isValidName = await models.Department.findOne({
    $or: [{ name: { $regex: new RegExp(`^${validName}$`, "i") } }, { code: { $regex: new RegExp(`^${validCode}$`, "i") } }],
    status: 0,
  });

  if (isValidName && isValidName.name.toLowerCase() === validName.toLowerCase()) {
    throw new Error("This name already in use", 400);
  } else if (isValidName && isValidName.code.toLowerCase() === validCode.toLowerCase()) {
    throw new Error("This code already in use", 400);
  }

  await models.Department({ name: validName, code: validCode, addedBy: userId }).save();

  return new Response("Department added successfully", null, 201);
});

export const updateDepartment = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid department provided", 400);
  let isValidId = await models.Department.findOne({
    _id: id,
    status: 0,
  });
  if (!isValidId) {
    throw new Error("Invalid department provided", 400);
  }

  let { name, code } = req.body;
  let validName = validateSpaceAndLetters(name, "Name", true);
  let validCode = validateSpaceAndLetters(code, "Code", true);

  let isValidName = await models.Department.findOne({
    _id: { $ne: id },
    $or: [{ name: { $regex: new RegExp(`^${validName}$`, "i") } }, { code: { $regex: new RegExp(`^${validCode}$`, "i") } }],
    status: 0,
  });

  if (isValidName && isValidName.name.toLowerCase() === validName.toLowerCase()) {
    throw new Error("This name already in use", 400);
  } else if (isValidName && isValidName.code.toLowerCase() === validCode.toLowerCase()) {
    throw new Error("This code already in use", 400);
  }

  await models.Department.findOneAndUpdate({ _id: id, status: 0 }, { name: validName, code: validCode, updatedBy: userId });
  return new Response("Department updated successfully", null, 200);
});

export const removeDepartment = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid department provided", 400);

  await models.Department.findOneAndUpdate({ _id: id, status: 0 }, { status: 1, updatedBy: userId });

  return new Response("Department removed successfully", null, 200);
});

export const listSampleData = asyncErrorHandler(async (req, res) => {
  let { skip, limit } = paginationValues(req.query);
  let { search, type } = req.query;

  let condition = { status: 0 };

  if (!isNull(search)) {
    condition.name = { $regex: search, $options: "i" };
  }

  if (!isNull(type) && ["1", "2"].includes(type)) {
    condition.type = Number(type);
  }

  let count = await models.Department.countDocuments(condition);
  let data = await models.SampleData.find(condition)
    .populate("addedBy", "firstName lastName username")
    .sort({ createdAt: -1 })
    .select("-__v -createdAt -updatedAt -status")
    .skip(skip)
    .limit(limit);

  return new Response("Sample data list", { count, data }, 200);
});

export const addSampleData = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;

  let payload = await sampleDataSchema(req.body);

  if (payload.error) {
    throw new Error(payload.error, 400);
  }

  let isValidName = await models.SampleData.findOne({
    type: payload?.type,
    name: { $regex: new RegExp(`^${payload.name}$`, "i") },
    status: 0,
  });

  if (isValidName) {
    throw new Error("This name already in use");
  }

  payload.addedBy = userId;
  await models.SampleData(payload).save();

  return new Response("Sample data added successfully", null, 201);
});

export const updateSampleData = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid Sample data provided", 400);
  let isValidId = await models.SampleData.findOne({
    _id: id,
    status: 0,
  });
  if (!isValidId) {
    throw new Error("Invalid Sample data provided", 400);
  }

  let payload = await sampleDataSchema(req.body);

  if (payload.error) {
    throw new Error(payload.error, 400);
  }

  let isValidName = await models.SampleData.findOne({
    _id: { $ne: id },
    type: payload?.type,
    name: { $regex: new RegExp(`^${payload.name}$`, "i") },
    status: 0,
  });

  if (isValidName) {
    throw new Error("This value already in use");
  }

  payload.updatedBy = userId;
  await models.SampleData.findByIdAndUpdate({ _id: id, status: 0 }, payload);

  return new Response("Sample data updated successfully", null, 200);
});

export const removeSampleData = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid Sample data provided", 400);

  await models.SampleData.findOneAndUpdate({ _id: id, status: 0 }, { status: 1, updatedBy: userId });

  return new Response("Sample data removed successfully", null, 200);
});

export const listRemarks = asyncErrorHandler(async (req, res) => {
  let { skip, limit } = paginationValues(req.query);
  let { search } = req.query;

  let condition = { status: 0 };

  if (!isNull(search)) {
    condition.name = { $regex: search, $options: "i" };
  }

  let count = await models.Remarks.countDocuments(condition);
  let data = await models.Remarks.find(condition)
    .lean()
    .populate("addedBy", "firstName lastName username")
    .populate("updatedBy", "firstName lastName username")
    .sort({ createdAt: -1 })
    .select("-__v -createdAt -updatedAt -status")
    .skip(skip)
    .limit(limit);
  return new Response("Remarks lists", { count, data }, 200);
});

export const addRemarks = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { name } = req.body;

  let validName = validateSpaceAndLetters(name);

  let isAlreadyUsed = await models.Remarks.findOne({
    name: { $regex: new RegExp(`^${validName}$`, "i") },
    status: 0,
  });

  if (isAlreadyUsed) throw new Error("This remark already in use", 400);

  await models.Remarks({ name: validName, addedBy: userId }).save();

  return new Response("Remarks added successfully", null, 201);
});

export const updateRemarks = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { id } = req.params;

  if (!checkObjectIdValid(id)) throw new Error("Invalid remark", 400);
  let isValidId = await models.Remarks.findOne({
    _id: id,
    status: 0,
  });
  if (!isValidId) throw new Error("Invalid remark", 400);

  let { name } = req.body;

  let validName = validateSpaceAndLetters(name);

  let isAlreadyUsed = await models.Remarks.findOne({
    _id: { $ne: id },
    name: { $regex: new RegExp(`^${validName}$`, "i") },
    status: 0,
  });

  if (isAlreadyUsed) throw new Error("This remark already in use", 400);

  await models.Remarks.findOneAndUpdate({ _id: id, status: 0 }, { name: validName, updatedBy: userId });
  return new Response("Remark updated Successfully", null, 200);
});

export const removeRemarks = asyncErrorHandler(async (req, res) => {
  let userId = req.user?._id;
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid remark", 400);

  await models.Remarks.findOneAndUpdate({ _id: id, status: 0 }, { status: 1, updatedBy: userId });
  return new Response("Remark removed successfully", null, 200);
});
