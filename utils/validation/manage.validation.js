import * as yup from "yup";
import { dynamicRequire, nameStartWithLetterRegex, objectIdRegex } from "./global.validation.js";

export const consumableSchema = async (body, required = true) => {
  const schema = yup
    .object({
      name: dynamicRequire(
        yup.string().typeError("Name must be string").matches(nameStartWithLetterRegex, "Name must start with a letter").max(200, "Name must be below 200 characters"),
        required,
        "Name is required"
      ),
      code: dynamicRequire(
        yup.string().typeError("Code must be string").matches(nameStartWithLetterRegex, "Code must start with a letter").max(200, "Code must be below 200 characters"),
        required,
        "Code is required"
      ),

      category: dynamicRequire(yup.string().typeError("Invalid category provided").matches(objectIdRegex, "Invalid category provided"), required, "Category is required"),
    })
    .strict()
    .noUnknown();

  try {
    return await schema.validate({ ...body, name: body?.name?.trim(), code: body?.code?.trim() }, { abortEarly: false });
  } catch (err) {
    return { error: err.errors[0] ?? err?.message };
  }
};

export const methodsSchema = async (body, required = true) => {
  const schema = yup
    .object({
      name: dynamicRequire(
        yup.string().typeError("Name must be string").matches(nameStartWithLetterRegex, "Name must start with a letter").max(200, "Name must be below 200 characters"),
        required,
        "Name is required"
      ),
      description: dynamicRequire(
        yup
          .string()
          .typeError("Description must be string")
          .matches(nameStartWithLetterRegex, "Description must start with a letter")
          .max(200, "Description must be below 200 characters"),
        required,
        "Description is required"
      ),
    })
    .strict()
    .noUnknown();

  try {
    return await schema.validate({ name: body?.name?.trim(), description: body?.description?.trim() }, { abortEarly: false });
  } catch (err) {
    return { error: err.errors[0] ?? err?.message };
  }
};

export const sampleSchema = async (body, required = true) => {
  const schema = yup
    .object({
      name: dynamicRequire(
        yup.string().typeError("Name must be string").matches(nameStartWithLetterRegex, "Name must start with a letter").max(200, "Name must be below 200 characters"),
        required,
        "Name is required"
      ),
      type: dynamicRequire(yup.number().typeError("Type must be number").oneOf([1, 2], "Type must be 1 or 2"), required, "Type is required"),
      id: dynamicRequire(yup.string().typeError("Id is must be string").matches(objectIdRegex, "Invalid id format provided"), required, "Id is required"),
      data: dynamicRequire(yup.string().typeError("Data is must be string").matches(objectIdRegex, "invalid Data format provided"), required, "Data is required"),
    })
    .strict()
    .noUnknown();

  try {
    return await schema.validate({ ...body, name: body?.name?.trim(), type: Number(body.type) }, { abortEarly: false });
  } catch (err) {
    return { error: err.errors[0] ?? err?.message };
  }
};

export const sampleDataSchema = async (body, required = true) => {
  const schema = yup
    .object({
      name: dynamicRequire(
        yup.string().typeError("Name must be string").matches(nameStartWithLetterRegex, "Name must start with a letter").max(200, "Name must be below 200 characters"),
        required,
        "Name is required"
      ),
      type: dynamicRequire(yup.number().typeError("Type must be number").oneOf([1, 2], "Type must be 1 or 2"), required, "Type is required"),
    })
    .strict()
    .noUnknown();

  try {
    return await schema.validate({ name: body?.name?.trim(), type: Number(body.type) }, { abortEarly: false });
  } catch (err) {
    return { error: err.errors[0] ?? err?.message };
  }
};
