import * as yup from "yup";
import { existedValue } from "../helper/functions.js";
import { mobileWithLandPhone, mobileOnly } from "./global.validation.js";
import { Error } from "express-error-catcher";

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const nameStartWithLetterRegex = /^[A-Za-z].*$/;
const mobileRegex = /^[6-9]\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const dynamicRequire = (schema, required, message) => (required ? schema.required(message) : schema);

export const supplierSchema = async (body, existingMobiles = [], existingEmails = [], required = true) => {
  const schema = yup
    .object({
      name: dynamicRequire(yup.string().max(200, "Name must be below 200 characters"), required, "Name is required"),
      company: yup.string().required("Company is required"),
      mobile: dynamicRequire(
        yup
          .string()
          .matches(mobileOnly, "Invalid mobile number")
          .test("unique-mobile", "Mobile number already exists", function (value) {
            if (!value) return true;
            return !existingMobiles.includes(value);
          }),
        required,
        "Mobile is required"
      ),
      email: yup
        .string()
        .email()
        .nullable()
        .test("unique-email", "Email already exists", function (value) {
          if (!value) return true;
          return !existingEmails.includes(value);
        }),
      state: yup.string().required("State is required"),
      gstIn: yup.string().required("GST is required"),
    })
    .strict()
    // .noUnknown();

  try {
    return await schema.validate(body, { abortEarly: false });
  } catch (err) {
    return { error: err.errors[0] };
  }
};