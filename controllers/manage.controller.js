import { asyncErrorHandler, Error, Response } from "express-error-catcher";

//! LocaL Imports
import { caseInsensitiveExact, checkObjectIdValid, paginationValues, querySearchSanitize, validateSpaceAndLetters } from "@/helper/index.js";
import models from "@/models/index.js";
import { methodsSchema, consumableSchema, sampleSchema, sampleDataSchema } from "@/validation/manage.validator.js";

//? units
export const listUnit = asyncErrorHandler(async (req) => {
  let { skip, limit, sortBy } = paginationValues(req.query);
  let { search } = req.query;

  let condition = { status: 0 };

  if (!isNull(search)) {
    search = querySearchSanitize(search);
    condition.name = { $regex: search, $options: "i" };
  }

  let count = await models.Units.countDocuments(condition);
  let data = await models.Units.find(condition)
    .lean()
    .populate("addedBy", "firstName lastName username")
    .populate("updatedBy", "firstName lastName username")
    .sort(sortBy)
    .select("-__v -createdAt -updatedAt -status")
    .skip(skip)
    .limit(limit);

  return new Response("Unit lists", { count, data }, 200);
});

export const addUnits = asyncErrorHandler(async (req) => {
  const name = validateSpaceAndLetters(req.body?.name, "name", true);

  let isAlreadyUsed = await models.Units.findOne({
    name: caseInsensitiveExact(name),
    status: 0,
  });

  if (isAlreadyUsed) throw new Error("This name already in use", 400);

  await new models.Units({ name, addedBy: req.user._id }).save();

  return new Response("Units added successfully", null, 201);
});

export const updateUnits = asyncErrorHandler(async (req) => {
  const { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid units", 400);

  const name = validateSpaceAndLetters(req.body?.name, "name", true);

  let isAlreadyUsed = await models.Units.findOne({
    _id: { $ne: id },
    name: caseInsensitiveExact(name),
    status: 0,
  }).lean();

  if (isAlreadyUsed) throw new Error("This name already in use", 400);

  let isFound = await models.Units.findOneAndUpdate({ _id: id, status: 0 }, { name, updatedBy: req.user._id });
  if (!isFound) throw new Error("Unit not found", 404);

  return new Response("Units updated Successfully", null, 200);
});

export const removeUnits = asyncErrorHandler(async (req) => {
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid units", 400);

  let isFound = await models.Units.findOneAndUpdate({ _id: id, status: 0 }, { status: 1, updatedBy: req.user._id });
  if (!isFound) throw new Error("Unit not found", 404);

  return new Response("Units removed successfully", null, 200);
});

//? methods
export const listMethods = asyncErrorHandler(async (req) => {
  let { skip, limit, sortBy } = paginationValues(req.query);
  let { search } = req.query;

  let condition = { status: 0 };

  if (!isNull(search)) {
    search = querySearchSanitize(search);
    condition.name = { $regex: search, $options: "i" };
  }

  let count = await models.Methods.countDocuments(condition);
  let data = await models.Methods.find(condition)
    .lean()
    .populate("addedBy", "firstName lastName username")
    .populate("updatedBy", "firstName lastName username")
    .sort(sortBy)
    .select("-__v -createdAt -updatedAt -status")
    .skip(skip)
    .limit(limit);

  return new Response("Method lists", { count, data }, 200);
});

export const addMethods = asyncErrorHandler(async (req) => {
  let payload = await methodsSchema(req.body);

  let isAlreadyUsed = await models.Methods.findOne({
    name: caseInsensitiveExact(payload.name),
    status: 0,
  });

  if (isAlreadyUsed) throw new Error("This name already in use", 400);

  payload.addedBy = req.user._id;
  await new models.Methods(payload).save();
  return new Response("Methods added successfully", null, 201);
});

export const updateMethods = asyncErrorHandler(async (req) => {
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid Method", 400);

  let payload = await methodsSchema(req.body);

  let isAlreadyUsed = await models.Methods.findOne({
    _id: { $ne: id },
    name: caseInsensitiveExact(payload.name),
    status: 0,
  });
  if (isAlreadyUsed) throw new Error("This name already in use", 400);

  payload.updatedBy = req.user._id;
  let isFound = await models.Methods.findOneAndUpdate({ _id: id, status: 0 }, payload);
  if (!isFound) throw new Error("Methods not found", 404);

  return new Response("Methods updated successfully", null, 200);
});

export const removeMethods = asyncErrorHandler(async (req) => {
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid method", 400);

  let isFound = await models.Methods.findOneAndUpdate({ _id: id, status: 0 }, { status: 1, updatedBy: req.user._id });
  if (!isFound) throw new Error("Methods not found", 404);

  return new Response("Methods removed successfully", null, 200);
});

//? antibiotics
export const listAntibiotics = asyncErrorHandler(async (req) => {
  let { skip, limit, sortBy } = paginationValues(req.query);
  let { search } = req.query;

  let condition = { status: 0 };

  if (!isNull(search)) {
    search = querySearchSanitize(search);
    condition.name = { $regex: search, $options: "i" };
  }

  let count = await models.Antibiotics.countDocuments(condition);
  let data = await models.Antibiotics.find(condition)
    .lean()
    .populate("addedBy", "firstName lastName username")
    .populate("updatedBy", "firstName lastName username")
    .sort(sortBy)
    .select("-__v -createdAt -updatedAt -status")
    .skip(skip)
    .limit(limit);

  return new Response("Antibiotic lists", { count, data }, 200);
});

export const addAntibiotics = asyncErrorHandler(async (req) => {
  const name = validateSpaceAndLetters(req.body?.name);

  const isValidName = await models.Antibiotics.findOne({
    name: caseInsensitiveExact(name),
    status: 0,
  });

  if (isValidName) {
    throw new Error("This name already in use", 400);
  }

  await new models.Antibiotics({ name, addedBy: req.user._id }).save();

  return new Response("Antibiotics added successfully", null, 201);
});

export const updateAntibiotics = asyncErrorHandler(async (req) => {
  const { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid antibiotics provided", 400);

  const name = validateSpaceAndLetters(req.body?.name);

  const isValidName = await models.Antibiotics.findOne({
    _id: { $ne: id },
    name: caseInsensitiveExact(name),
    status: 0,
  });
  if (isValidName) {
    throw new Error("This name already in use", 400);
  }

  const isFound = await models.Antibiotics.findOneAndUpdate({ _id: id, status: 0 }, { name, updatedBy: req.user._id });
  if (!isFound) throw new Error("Antibiotics not found", 404);

  return new Response("Antibiotics updated successfully", null, 200);
});

export const removeAntibiotics = asyncErrorHandler(async (req) => {
  const { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid antibiotics provided", 400);

  const isFound = await models.Antibiotics.findOneAndUpdate({ _id: id, status: 0 }, { status: 1, updatedBy: req.user._id });
  if (!isFound) throw new Error("Antibiotics not found", 404);

  return new Response("Antibiotics removed successfully", null, 200);
});

//? analysis type
export const listAnalysisType = asyncErrorHandler(async (req) => {
  let { skip, limit, sortBy } = paginationValues(req.query);
  let { search } = req.query;

  let condition = { status: 0 };

  if (!isNull(search)) {
    search = querySearchSanitize(search);
    condition.name = { $regex: search, $options: "i" };
  }

  let count = await models.AnalysisType.countDocuments(condition);
  let data = await models.AnalysisType.find(condition)
    .lean()
    .populate("addedBy", "firstName lastName username")
    .populate("updatedBy", "firstName lastName username")
    .sort(sortBy)
    .select("-__v -createdAt -updatedAt -status")
    .skip(skip)
    .limit(limit);

  return new Response("Analysis lists", { count, data }, 200);
});

export const addAnalysisType = asyncErrorHandler(async (req) => {
  const name = validateSpaceAndLetters(req.body?.name);

  const isValidName = await models.AnalysisType.findOne({
    name: caseInsensitiveExact(name),
    status: 0,
  });
  if (isValidName) {
    throw new Error("This name already in use", 400);
  }

  await new models.AnalysisType({ name, addedBy: req.user._id }).save();

  return new Response("Analysis type added successfully", null, 201);
});

export const updateAnalysisType = asyncErrorHandler(async (req) => {
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid analysis type provided", 400);

  const name = validateSpaceAndLetters(req.body?.name);

  const isValidName = await models.AnalysisType.findOne({
    _id: { $ne: id },
    name: caseInsensitiveExact(name),
    status: 0,
  });
  if (isValidName) {
    throw new Error("This name already in use", 400);
  }

  let isFound = await models.AnalysisType.findOneAndUpdate({ _id: id, status: 0 }, { name, updatedBy: req.user._id });
  if (!isFound) throw new Error("Analysis type not found", 404);

  return new Response("Analysis type updated successfully", null, 200);
});

export const removeAnalysisType = asyncErrorHandler(async (req) => {
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid analysis type provided", 400);

  let isFound = await models.AnalysisType.findOneAndUpdate({ _id: id, status: 0 }, { status: 1, updatedBy: req.user._id });
  if (!isFound) throw new Error("Analysis type not found", 404);

  return new Response("Analysis type removed successfully", null, 200);
});

//? consumable
export const listConsumable = asyncErrorHandler(async (req) => {
  let { skip, limit, sortBy } = paginationValues(req.query);
  let { search, category } = req.query;

  let condition = { status: 0 };

  if (!isNull(search)) {
    search = querySearchSanitize(search);
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
    .sort(sortBy)
    .select("-__v -createdAt -updatedAt -status")
    .skip(skip)
    .limit(limit);

  return new Response("Consumable lists", { count, data }, 200);
});

export const addConsumable = asyncErrorHandler(async (req) => {
  const payload = await consumableSchema(req.body);

  const isValidName = await models.Consumable.findOne({
    $or: [{ name: caseInsensitiveExact(payload.name) }, { code: caseInsensitiveExact(payload.code) }],
    status: 0,
  });

  if (isValidName && isValidName.name.toLowerCase() === payload.name.toLowerCase()) {
    throw new Error("This name already in use", 400);
  } else if (isValidName && isValidName.code.toLowerCase() === payload.code.toLowerCase()) {
    throw new Error("This code already in use", 400);
  }

  const isValidCategory = await models.ConsumableCategory.findOne({
    _id: payload.category,
    status: 0,
  });
  if (isNull(isValidCategory)) {
    throw new Error("Invalid category provided", 400);
  }

  payload.addedBy = req.user._id;
  await new models.Consumable(payload).save();

  return new Response("Consumable added successfully", null, 201);
});

export const updateConsumable = asyncErrorHandler(async (req) => {
  const { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid consumable provided", 400);

  let isValidId = await models.Consumable.findOne({
    _id: id,
    status: 0,
  });
  if (!isValidId) throw new Error("Invalid consumable provided", 400);

  const payload = await consumableSchema(req.body);

  const isValidName = await models.Consumable.findOne({
    _id: { $ne: id },
    $or: [{ name: caseInsensitiveExact(payload.name) }, { code: caseInsensitiveExact(payload.code) }],
    status: 0,
  });

  if (isValidName && isValidName.name.toLowerCase() === payload.name.toLowerCase()) {
    throw new Error("This name already in use", 400);
  } else if (isValidName && isValidName.code.toLowerCase() === payload.code.toLowerCase()) {
    throw new Error("This code already in use", 400);
  }

  const isValidCategory = await models.ConsumableCategory.findOne({
    _id: payload.category,
    status: 0,
  });
  if (isNull(isValidCategory)) {
    throw new Error("Invalid category category provided", 400);
  }

  payload.updatedBy = req.user._id;
  const isFound = await models.Consumable.findOneAndUpdate({ _id: id, status: 0 }, payload);
  if (!isFound) throw new Error("Consumable not found", 404);

  return new Response("Consumable updated successfully", null, 200);
});

export const removeConsumable = asyncErrorHandler(async (req) => {
  const { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid consumable provided", 400);

  const isFound = await models.Consumable.findOneAndUpdate({ _id: id, status: 0 }, { status: 1, updatedBy: req.user._id });
  if (!isFound) throw new Error("Consumable not found", 404);

  return new Response("Consumable removed successfully", null, 200);
});

//? consumable category
export const listConsumableCategory = asyncErrorHandler(async (req) => {
  let { skip, limit, sortBy } = paginationValues(req.query);
  let { search } = req.query;

  let condition = { status: 0 };

  if (!isNull(search)) {
    search = querySearchSanitize(search);
    condition.name = { $regex: search, $options: "i" };
  }

  let count = await models.ConsumableCategory.countDocuments(condition);
  let data = await models.ConsumableCategory.find(condition)
    .lean()
    .populate("addedBy", "firstName lastName username")
    .populate("updatedBy", "firstName lastName username")
    .sort(sortBy)
    .select("-__v -createdAt -updatedAt -status")
    .skip(skip)
    .limit(limit);

  return new Response("Consumable category lists", { count, data }, 200);
});

export const addConsumableCategory = asyncErrorHandler(async (req) => {
  const name = validateSpaceAndLetters(req.body?.name);

  const isValidName = await models.ConsumableCategory.findOne({
    name: caseInsensitiveExact(name),
    status: 0,
  });
  if (isValidName) {
    throw new Error("This value already in use", 400);
  }

  await new models.ConsumableCategory({ name, addedBy: req.user._id }).save();

  return new Response("Consumable category added successfully", null, 201);
});

export const updateConsumableCategory = asyncErrorHandler(async (req) => {
  const { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid consumable category provided", 400);

  const name = validateSpaceAndLetters(req.body?.name);

  let isValidName = await models.ConsumableCategory.findOne({
    _id: { $ne: id },
    name: caseInsensitiveExact(name),
    status: 0,
  });
  if (isValidName) {
    throw new Error("This name already in use", 400);
  }

  await models.ConsumableCategory.findOneAndUpdate({ _id: id, status: 0 }, { name, updatedBy: req.user._id });
  return new Response("Consumable category updated successfully", null, 200);
});

export const removeConsumableCategory = asyncErrorHandler(async (req) => {
  const { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid consumable category provided", 400);

  await models.ConsumableCategory.findOneAndUpdate({ _id: id, status: 0 }, { status: 1, updatedBy: req.user._id });

  return new Response("Consumable category removed successfully", null, 200);
});

//? range type
export const listRangeType = asyncErrorHandler(async (req) => {
  let { skip, limit, sortBy } = paginationValues(req.query);
  let { search } = req.query;

  let condition = { status: 0 };

  if (!isNull(search)) {
    search = querySearchSanitize(search);
    condition.name = { $regex: search, $options: "i" };
  }

  let count = await models.RangeType.countDocuments(condition);
  let data = await models.RangeType.find(condition)
    .lean()
    .populate("addedBy", "firstName lastName username")
    .populate("updatedBy", "firstName lastName username")
    .sort(sortBy)
    .select("-__v -createdAt -updatedAt -status")
    .skip(skip)
    .limit(limit);

  return new Response("Range type lists", { count, data }, 200);
});

export const addRangeType = asyncErrorHandler(async (req) => {
  const name = validateSpaceAndLetters(req.bodya?.nme, "name", true);

  const isValidName = await models.RangeType.findOne({
    name: caseInsensitiveExact(name),
    status: 0,
  });
  if (isValidName) {
    throw new Error("This name already in use", 400);
  }

  await new models.RangeType({ name, addedBy: req.user._id }).save();

  return new Response("Range type added successfully", null, 201);
});

export const updateRangeType = asyncErrorHandler(async (req) => {
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid range type provided", 400);

  const name = validateSpaceAndLetters(req.body?.name, "name", true);

  const isValidName = await models.RangeType.findOne({
    _id: { $ne: id },
    name: caseInsensitiveExact(name),
    status: 0,
  });

  if (isValidName) {
    throw new Error("This name already in use", 400);
  }

  let isFound = await models.RangeType.findOneAndUpdate({ _id: id, status: 0 }, { name, updatedBy: req.user._id });
  if (!isFound) throw new Error("Range type not found", 404);

  return new Response("Range type updated successfully", null, 200);
});

export const removeRangeType = asyncErrorHandler(async (req) => {
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid range type provided", 400);

  let isFound = await models.RangeType.findOneAndUpdate({ _id: id, status: 0 }, { status: 1, updatedBy: req.user._id });
  if (!isFound) throw new Error("Range type not found", 404);

  return new Response("Range type removed successfully", null, 200);
});

//? sample
export const listSample = asyncErrorHandler(async (req) => {
  let { skip, limit, sortBy } = paginationValues(req.query);
  let { search, type } = req.query;

  let condition = { status: 0 };

  if (!isNull(search)) {
    search = querySearchSanitize(search);
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
    .populate("addedBy", "firstName lastName username")
    .populate("updatedBy", "firstName lastName username")
    .sort(sortBy)
    .select("-__v -createdAt -updatedAt -status")
    .skip(skip)
    .limit(limit);

  return new Response("Sample List", { count, data }, 200);
});

export const addSample = asyncErrorHandler(async (req) => {
  const payload = await sampleSchema(req.body);

  let isValidName = await models.Sample.findOne({
    type: payload?.type,
    name: caseInsensitiveExact(payload.name),
    $or: [{ culture: payload?.id }, { examination: payload?.id }],
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

  payload.addedBy = req.user._id;

  await new models.Sample(payload).save();

  return new Response("Sample added successfully", null, 201);
});

export const updateSample = asyncErrorHandler(async (req) => {
  const { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid sample provided", 400);

  let payload = await sampleSchema(req.body);

  const isValidName = await models.Sample.findOne({
    _id: { $ne: id },
    type: payload?.type,
    name: caseInsensitiveExact(payload.name),
    $or: [{ culture: payload?.id }, { examination: payload?.id }],
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

  payload.updatedBy = req.user._id;
  let isFound = await models.Sample.findOneAndUpdate({ _id: id, status: 0 }, payload);
  if (!isFound) throw new Error("Sample not found", 404);

  return new Response("Sample Updated successfully", null, 200);
});

export const removeSample = asyncErrorHandler(async (req) => {
  const { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid sample provided", 400);

  let isFound = await models.Sample.findOneAndUpdate({ _id: id, status: 0 }, { status: 1, updatedBy: req.user._id });
  if (!isFound) throw new Error("Sample not found", 404);

  return new Response("Sample removed successfully", null, 200);
});

//? sample data
export const listSampleData = asyncErrorHandler(async (req) => {
  let { skip, limit, sortBy } = paginationValues(req.query);
  let { search, type } = req.query;

  let condition = { status: 0 };

  if (!isNull(search)) {
    search = querySearchSanitize(search);
    condition.name = { $regex: search, $options: "i" };
  }

  if (!isNull(type) && ["1", "2"].includes(type)) {
    condition.type = Number(type);
  }

  let count = await models.SampleData.countDocuments(condition);
  let data = await models.SampleData.find(condition)
    .populate("addedBy", "firstName lastName username")
    .populate("updatedBy", "firstName lastName username")
    .sort(sortBy)
    .select("-__v -createdAt -updatedAt -status")
    .skip(skip)
    .limit(limit);

  return new Response("Sample data list", { count, data }, 200);
});

export const addSampleData = asyncErrorHandler(async (req) => {
  const payload = await sampleDataSchema(req.body);

  const isValidName = await models.SampleData.findOne({
    type: payload?.type,
    name: caseInsensitiveExact(payload.name),
    status: 0,
  });
  if (isValidName) {
    throw new Error("This name already in use");
  }

  payload.addedBy = req.user._id;
  await new models.SampleData(payload).save();

  return new Response("Sample data added successfully", null, 201);
});

export const updateSampleData = asyncErrorHandler(async (req) => {
  const { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid Sample data provided", 400);

  let payload = await sampleDataSchema(req.body);

  const isValidName = await models.SampleData.findOne({
    _id: { $ne: id },
    type: payload?.type,
    name: caseInsensitiveExact(payload.name),
    status: 0,
  });
  if (isValidName) {
    throw new Error("This value already in use");
  }

  payload.updatedBy = req.user._id;
  let isFound = await models.SampleData.findByIdAndUpdate({ _id: id, status: 0 }, payload);
  if (!isFound) throw new Error("Sample data not found", 404);

  return new Response("Sample data updated successfully", null, 200);
});

export const removeSampleData = asyncErrorHandler(async (req) => {
  const { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid Sample data provided", 400);

  const isFound = await models.SampleData.findOneAndUpdate({ _id: id, status: 0 }, { status: 1, updatedBy: req.user._id });
  if (!isFound) throw new Error("Sample data not found", 404);

  return new Response("Sample data removed successfully", null, 200);
});

//? department
export const listDepartments = asyncErrorHandler(async (req) => {
  let { skip, limit, sortBy } = paginationValues(req.query);
  let { search } = req.query;

  let condition = { status: 0 };

  if (!isNull(search)) {
    search = querySearchSanitize(search);
    condition.$or = [{ name: { $regex: search, $options: "i" } }, { code: { $regex: search, $options: "i" } }];
  }

  let count = await models.Department.countDocuments(condition);
  let data = await models.Department.find(condition)
    .lean()
    .populate("addedBy", "firstName lastName username")
    .populate("updatedBy", "firstName lastName username")
    .sort(sortBy)
    .select("-__v -createdAt -updatedAt -status")
    .skip(skip)
    .limit(limit);

  return new Response("Department lists", { count, data }, 200);
});

export const addDepartment = asyncErrorHandler(async (req) => {
  const name = validateSpaceAndLetters(req.body?.name, "Name", true);
  const code = validateSpaceAndLetters(req.body?.code, "Code", true);

  let isValidName = await models.Department.findOne({
    $or: [{ name: caseInsensitiveExact(name) }, { code: caseInsensitiveExact(code) }],
    status: 0,
  });

  if (isValidName && isValidName.name.toLowerCase() === name.toLowerCase()) {
    throw new Error("This name already in use", 400);
  } else if (isValidName && isValidName.code.toLowerCase() === code.toLowerCase()) {
    throw new Error("This code already in use", 400);
  }

  await models.Department({ name, code, addedBy: req.user._id }).save();

  return new Response("Department added successfully", null, 201);
});

export const updateDepartment = asyncErrorHandler(async (req) => {
  const { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid department provided", 400);

  const name = validateSpaceAndLetters(req.body?.name, "Name", true);
  const code = validateSpaceAndLetters(req.body?.code, "Code", true);

  const isValidName = await models.Department.findOne({
    _id: { $ne: id },
    $or: [{ name: caseInsensitiveExact(name) }, { code: caseInsensitiveExact(code) }],
    status: 0,
  });

  if (isValidName && isValidName.name.toLowerCase() === name.toLowerCase()) {
    throw new Error("This name already in use", 400);
  } else if (isValidName && isValidName.code.toLowerCase() === code.toLowerCase()) {
    throw new Error("This code already in use", 400);
  }

  let isFound = await models.Department.findOneAndUpdate({ _id: id, status: 0 }, { name, code, updatedBy: req.user._id });
  if (!isFound) throw new Error("Department not found", 404);

  return new Response("Department updated successfully", null, 200);
});

export const removeDepartment = asyncErrorHandler(async (req) => {
  const { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid department provided", 400);

  let isFound = await models.Department.findOneAndUpdate({ _id: id, status: 0 }, { status: 1, updatedBy: req.user._id });
  if (!isFound) throw new Error("Department not found", 404);

  return new Response("Department removed successfully", null, 200);
});

//? remarks
export const listRemarks = asyncErrorHandler(async (req) => {
  let { skip, limit, sortBy } = paginationValues(req.query);
  let { search } = req.query;

  let condition = { status: 0 };

  if (!isNull(search)) {
    search = querySearchSanitize(search);
    condition.name = { $regex: search, $options: "i" };
  }

  let count = await models.Remarks.countDocuments(condition);
  let data = await models.Remarks.find(condition)
    .lean()
    .populate("addedBy", "firstName lastName username")
    .populate("updatedBy", "firstName lastName username")
    .sort(sortBy)
    .select("-__v -createdAt -updatedAt -status")
    .skip(skip)
    .limit(limit);

  return new Response("Remarks lists", { count, data }, 200);
});

export const addRemarks = asyncErrorHandler(async (req) => {
  const name = validateSpaceAndLetters(req.body?.name);

  const isAlreadyUsed = await models.Remarks.findOne({
    name: caseInsensitiveExact(name),
    status: 0,
  });
  if (isAlreadyUsed) throw new Error("This remark already in use", 400);

  await new models.Remarks({ name, addedBy: req.user._id }).save();

  return new Response("Remarks added successfully", null, 201);
});

export const updateRemarks = asyncErrorHandler(async (req) => {
  const { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid remark", 400);

  const name = validateSpaceAndLetters(req.body?.name);

  let isAlreadyUsed = await models.Remarks.findOne({
    _id: { $ne: id },
    name: caseInsensitiveExact(name),
    status: 0,
  });

  if (isAlreadyUsed) throw new Error("This remark already in use", 400);

  let isFound = await models.Remarks.findOneAndUpdate({ _id: id, status: 0 }, { name, updatedBy: req.user._id });
  if (!isFound) throw new Error("Remark not found", 404);

  return new Response("Remark updated Successfully", null, 200);
});

export const removeRemarks = asyncErrorHandler(async (req) => {
  let { id } = req.params;
  if (!checkObjectIdValid(id)) throw new Error("Invalid remark", 400);

  const isFound = await models.Remarks.findOneAndUpdate({ _id: id, status: 0 }, { status: 1, updatedBy: req.user._id });
  if (!isFound) throw new Error("Remark not found", 404);
  
  return new Response("Remark removed successfully", null, 200);
});

//? health condition
export const listHealthCondition = asyncErrorHandler(async (req) => {});
export const addHealthCondition = asyncErrorHandler(async (req) => {});
export const updateHealthCondition = asyncErrorHandler(async (req) => {});
export const removeHealthCondition = asyncErrorHandler(async (req) => {});

//? health risk
export const listHealthRisk = asyncErrorHandler(async (req) => {});
export const addHealthRisk = asyncErrorHandler(async (req) => {});
export const updateHealthRisk = asyncErrorHandler(async (req) => {});
export const removeHealthRisk = asyncErrorHandler(async (req) => {});
