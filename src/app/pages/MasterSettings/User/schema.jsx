import { dateRegex, ObjectIdRegex, yupMobileValidation } from "utility";
import * as yup from "yup";

export const userSchema = yup
  .object({
    firstName: yup
      .string()
      .min(3, "at least 3 characters")
      .max(200, "cannot exceed 200 characters")
      .required("First name is required"),
    lastName: yup.string().max(200, "cannot exceed 200 characters").nullable(),
    mobile: yupMobileValidation(yup.string()),
    email: yup.string().email(),
    username: yup
      .string()
      .max(150, "Must be below 150 characters")
      .required("Username is required"),
    dob: yup.string().matches(dateRegex, "Invalid date format"),
    signature: yup.string().matches(ObjectIdRegex, "Invalid signature"),
    password: yup
      .string()
      .min(8, "at least 8 characters long")
      .max(20, "must be 20 characters")
      .matches(/[A-Z]/, "at least one uppercase letter")
      .matches(/\d/, "at least one number")
      .matches(/[!@#$%^&*(),.?":{}|<>]/, "at least one special character")
      .when("_id", {
        is: (val) => !val,
        then: (schema) => schema.required("Password is required"),
        otherwise: (schema) => schema.notRequired(),
      }),

    privilege: yup.string().required("Privilege is required"),
    gender: yup.number().oneOf([1, 2, 3], "Gender must be 1, 2, or 3"),
    module: yup.string().required("Module is required"),
    company: yup.string().required("Company is required"),

    type: yup
      .number()
      .oneOf([1, 2, 3, 4], "Type must be 1, 2, 3 or 4")
      .required("Type is required"),

    department: yup.string().required("Department is required"),
    branch: yup.string().required("Branch is required"),
    subBranch: yup.string().nullable(),
    franchise: yup.string().nullable(),
    collectionCenter: yup.string().nullable(),

    image: yup
      .mixed()
      .nullable()
      .test("fileOrString", "Invalid image input", (value) => {
        return !value || value instanceof File;
      })
      .test("fileType", "Only PNG and JPEG files are allowed", (value) => {
        if (value instanceof File) {
          return ["image/png", "image/jpeg"].includes(value.type);
        }
        return true;
      })
      .test("fileSize", "File is too large, maximum size is 5MB", (value) => {
        if (value instanceof File) {
          return value.size <= 5 * 1024 * 1024;
        }
        return true;
      }),
  })
  .test(
    "condition-validation",
    "Invalid fields for given type",
    function (values) {
      const { collectionCenter, subBranch, franchise, type } = values;

      if (!type)
        return this.createError({ path: "type", message: "Type is required" });

      if (type === 2 && !subBranch) {
        return this.createError({
          path: "subBranch",
          message: `Sub branch is required`,
        });
      }

      if (type === 3 && !franchise) {
        return this.createError({
          path: "franchise",
          message: `Franchise is required`,
        });
      }

      if (type === 4 && !collectionCenter) {
        return this.createError({
          path: "collectionCenter",
          message: "Collection Center is required",
        });
      }

      return true;
    },
  );

export const singleChangeSchema = yup.object().shape({
  type: yup.number().oneOf([1, 2], "Invalid type").required("Type is required"),

  privilege: yup.string().when("type", {
    is: (type) => type === 1,
    then: (schema) => schema.required("Privilege is required"),
    otherwise: (schema) => schema.notRequired().nullable(),
  }),

  password: yup
    .string()
    .min(8, "at least 8 characters long")
    .max(20, "must be 20 characters")
    .matches(/[A-Z]/, "at least one uppercase letter")
    .matches(/\d/, "at least one number")
    .matches(/[!@#$%^&*(),.?":{}|<>]/, "at least one special character")
    .when("type", {
      is: (type) => type === 2,
      then: (schema) => schema.required("Password is required"),
      otherwise: (schema) => schema.notRequired(),
    }),
});
