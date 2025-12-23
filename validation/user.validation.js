import { dynamicRequire, nameStartWithLetterRegex, objectIdRegex } from "@/helper/regex.js";
import { Error } from "express-error-catcher";
import * as yup from "yup";

export const userSchema = async (body, required = true) => {
  const schema = yup
    .object({
      company: yup
        .array()
        .of(yup.string().required("Company name cannot be empty"))
        .min(1, "At least one company is required")
        .required("Company is required"),

      branch: yup
        .array()
        .of(yup.string().required("Branch name cannot be empty"))
        .min(1, "At least one branch is required")
        .required("Branch is required"),

      firstName: dynamicRequire(
        yup
          .string()
          .matches(nameStartWithLetterRegex, "first name must start with a letter and contain at least one letter")
          .max(200, "firstName must be below 200 characters"),
        required,
        "firstName is required"
      ),
      lastName: yup.string().max(200, "lastName must be below 200 characters"),
      mobile: yup.string().required(),

      email: yup.string().email().nullable().default(null),

      username: dynamicRequire(
        yup
          .string()
          .matches(nameStartWithLetterRegex, "username must start with a letter and contain at least one letter")
          .max(150, "username must be below 150 characters"),
        required,
        "username is required"
      ),
      password: dynamicRequire(
        yup
          .string()
          .min(8, "password must be at least 8 characters long")
          .max(20, "password must be 20 characters")
          .matches(/[A-Z]/, "password must contain at least one uppercase letter")
          .matches(/\d/, "password must contain at least one number")
          .matches(/[!@#$%^&*(),.?":{}|<>]/, "password must contain at least one special character"),
        required,
        "password is required"
      ),
      // dob: yup.string().matches(/^\d{4}-\d{2}-\d{2}$/, "dob must be in YYYY-MM-DD format"),
      privilege: dynamicRequire(yup.string().matches(objectIdRegex, "invalid privilege id format"), required, "privilege is required"),
      gender: yup.number().oneOf([1, 2, 3], "gender must be 1, 2, or 3"),
      module: dynamicRequire(yup.string().matches(objectIdRegex, "invalid module id format"), required, "module is required"),
    })
    .strict();

  try {
    let obj = { ...body };

    return await schema.validate(obj, { abortEarly: false });
  } catch (err) {
    let error = Array.isArray(err.errors) ? err.errors[0] : err.message;
    throw new Error(error, 400);
  }
};

export const userBasicSchema = async (body, required = true) => {
  const schema = yup
    .object({
      firstName: dynamicRequire(
        yup
          .string()
          .matches(nameStartWithLetterRegex, "first name must start with a letter and contain at least one letter")
          .max(200, "firstName must be below 200 characters"),
        required,
        "firstName is required"
      ),
      lastName: yup
        .string()
        // .matches(nameStartWithLetterRegex, "last name must start with a letter and contain at least one letter")
        .max(200, "lastName must be below 200 characters")
        .transform((item) => (item === "" ? null : item))
        .nullable(),
      mobile: yup.string().matches(/^(\+?\d{1,3}[- ]?)?[6-9]\d{9}$/, "invalid mobile number"),
      email: yup.string().email(),
      username: dynamicRequire(
        yup
          .string()
          .matches(nameStartWithLetterRegex, "username must start with a letter and contain at least one letter")
          .max(150, "username must be below 150 characters"),
        required,
        "username is required"
      ),
    })
    .noUnknown();

  try {
    let obj = { ...body };

    return await schema.validate(obj, { abortEarly: false });
  } catch (err) {
    let error = Array.isArray(err.errors) ? err.errors[0] : err.message;
    throw new Error(error, 400);
  }
};
