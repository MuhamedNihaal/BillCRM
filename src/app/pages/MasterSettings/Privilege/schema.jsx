import * as yup from "yup";

export const privilegeSchema = yup.object({
  name: yup
    .string()
    .required("Name is required")
    .max(50, "Name must be less than 50 characters"),
  code: yup
    .string()
    .required("Code is required")
    .max(15, "Name must be less than 15 characters"),
});
