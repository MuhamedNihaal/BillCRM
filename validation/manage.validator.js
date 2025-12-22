import * as yup from "yup";
import { Error } from "express-error-catcher";
import { nameStartWithLetterRegex, objectIdRegex } from "@/helper/regex.js";

export const methodsSchema = async (body) => {
  const schema = yup
    .object({
      name: yup
        .string()
        .matches(nameStartWithLetterRegex, "Name must start with a letter")
        .max(100, "Name must be below 200 characters")
        .required("Name is required"),
      description: yup.string().max(200, "Description must be below 200 characters").nullable().default(null),
    })
    .noUnknown();

  try {
    return await schema.validate(body, { abortEarly: false, stripUnknown: false });
  } catch (err) {
    let message = Array.isArray(err.errors[0]) ? err.errors[0]?.message : err?.message;
    throw new Error(message, 400);
  }
};

export const consumableSchema = async (body) => {
  const schema = yup
    .object({
      name: yup
        .string()
        .matches(nameStartWithLetterRegex, "Name must start with a letter")
        .max(100, "Name must be below 200 characters")
        .required("Name is required"),
      code: yup.string().max(15, "Code must be below 15 characters").required("Code is required"),
      category: yup.string().matches(objectIdRegex, "Invalid category id").required("Category is required"),
    })
    .noUnknown();

  try {
    return await schema.validate(body, { abortEarly: false, stripUnknown: false });
  } catch (err) {
    let message = Array.isArray(err.errors[0]) ? err.errors[0]?.message : err?.message;
    throw new Error(message, 400);
  }
};

export const sampleSchema = async (body) => {
  const schema = yup
    .object({
      name: yup.string().max(500, "Name must be below 500 characters").required("Name is required"),
      type: yup.number().oneOf([1, 2], "Type must be 1 or 2").required("Code is required"),
      id: yup.string().matches(objectIdRegex, "Invalid id format provided").required("ID is required"),
      data: yup.string().matches(objectIdRegex, "Invalid data format provided").required("Data is required"),
    })
    .noUnknown();

  try {
    return await schema.validate({ ...body, type: Number(body.type) }, { abortEarly: false, stripUnknown: false });
  } catch (err) {
    let message = Array.isArray(err.errors[0]) ? err.errors[0]?.message : err?.message;
    throw new Error(message, 400);
  }
};

export const sampleDataSchema = async (body) => {
  const schema = yup
    .object({
      name: yup.string().max(200, "Name must be below 200 characters").required("Name is required"),
      type: yup.number().oneOf([1, 2], "Type must be 1 or 2").required("Code is required"),
    })
    .noUnknown();

  try {
    return await schema.validate({ ...body, type: Number(body.type) }, { abortEarly: false, stripUnknown: false });
  } catch (err) {
    let message = Array.isArray(err.errors[0]) ? err.errors[0]?.message : err?.message;
    throw new Error(message, 400);
  }
};