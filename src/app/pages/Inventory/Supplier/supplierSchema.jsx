import * as yup from "yup";
// import { emailRegex } from "../../../../../utility/functions";

export const supplierSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required("Name is required")
    .min(3, "Name must be at least 3 characters"),
  company: yup
    .string()
    .trim()
    .required("Company is required")
    .min(3, "Company must be at least 3 characters"),
  mobile: yup
    .string()
    .required("Mobile is required")
    .min(10, "Mobile must be at least 10 characters")
    .max(10, "Mobile number must not exceed 10 characters")
    .matches(/^\d+$/, "Mobile must be a number")
    .trim(),
  // email: yup.string().trim().matches(emailRegex, "Invalid email address").nullable(),
  email: yup.string().email("Invalid email format").nullable(),
  state: yup.string().trim().required("State is required"),
  gstIn: yup.string().trim().required("GST IN is required"),
  address: yup.string().trim("Address cannot be empty"),
  accountNo: yup
    .string()
    .trim()
    .nullable()
    .notRequired()
    .test("is-number", "Account number must be a number", function (value) {
      // If value is null, undefined, or empty string, it's valid (not required)
      if (!value || value === "") {
        return true;
      }
      // If value exists, check if it's a number
      return /^\d+$/.test(value);
    }),
  bank: yup.string().trim(),
  // branch: yup.string().trim("Branch cannot be empty")
});
