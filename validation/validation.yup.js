import * as yup from "yup";
import { existedValue } from "../helper/functions.js";
import { mobileWithLandPhone, mobileOnly } from "./global.validation.js";

export const logInBodyValidation = async (body) => {
  const schema = yup.object({
    username: yup.string().required("Username is required").max(150, "Username must be below 150 characters"),
    password: yup.string().required("Password is required").max(20, "Password must be below 20 characters"),
    rememberMe: yup.boolean(),
  });

  try {
    return await schema.validate(body, { abortEarly: false });
  } catch (err) {
    return { error: err.errors[0] };
  }
};

export const ChangePasswordSchema = async (body) => {
  const schema = yup.object({
    currentPassword: yup.string().trim().required("Current password is required"),
    newPassword: yup
      .string()
      .trim()
      .required("New password is required")
      .min(8, "Password must be at least 8 characters")
      .max(15, "Password must be at most 15 characters")
      .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
      .matches(/[!@#$%^&*(),.?":{}|<>]/, "Password must contain at least one special character"),
    confirmPassword: yup
      .string()
      .trim()
      .oneOf([yup.ref("newPassword"), null], "Passwords must match")
      .required("Please confirm your new password"),
  });

  try {
    return await schema.validate(body, { abortEarly: false });
  } catch (err) {
    return { error: err.errors[0] };
  }
};

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const nameStartWithLetterRegex = /^[A-Za-z].*$/;
const mobileRegex = /^[6-9]\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const dynamicRequire = (schema, required, message) => (required ? schema.required(message) : schema);

export const userSchema = async (body, required = true) => {
  const schema = yup
    .object({
      type: dynamicRequire(
        yup.number().oneOf([1, 2, 3, 4], "type must be 1, 2, 3 or 4").typeError("type must be number"),
        required,
        "type is required"
      ),
      company: yup.string().matches(objectIdRegex, "invalid company id provided").typeError("branch must be string").required("company is required"),
      branch: yup.string().matches(objectIdRegex, "invalid branch id provided").typeError("branch must be string").required("branch is required"),
      subBranch: yup.string().matches(objectIdRegex, "invalid branch id provided").typeError("branch must be string"),
      franchise: yup.string().matches(objectIdRegex, "invalid branch id provided").typeError("branch must be string"),
      collectionCenter: yup.string().matches(objectIdRegex, "invalid collection center id provided").typeError("collection center id must be string"),
      department: yup.string().matches(objectIdRegex, "invalid collection center id provided").typeError("collection center id must be string"),
      imageChanged: yup.boolean(),

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
        .matches(nameStartWithLetterRegex, "last name must start with a letter and contain at least one letter")
        .max(200, "lastName must be below 200 characters"),
      mobile: yup.string().matches(mobileWithLandPhone, "invalid mobile number"),

      email: yup.string().email(),

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
      dob: yup.string().matches(/^\d{4}-\d{2}-\d{2}$/, "dob must be in YYYY-MM-DD format"),
      privilege: dynamicRequire(yup.string().matches(objectIdRegex, "invalid privilege id format"), required, "privilege is required"),
      gender: yup.number().oneOf([1, 2, 3], "gender must be 1, 2, or 3"),
      module: dynamicRequire(yup.string().matches(objectIdRegex, "invalid module id format"), required, "module is required"),
    })
    .test("condition-validation", "invalid fields for given type", (values) => {
      const { type, subBranch, collectionCenter, franchise } = values;

      if (type === 1) {
        if (subBranch || franchise || collectionCenter) {
          return this.createError({ message: "Type 1 must not have sub branch, franchise, or collection center" });
        }
      }

      if (type === 2) {
        if (!subBranch) {
          return this.createError({ message: "Type 2 requires sub branch" });
        }
        if (franchise || collectionCenter) {
          return this.createError({ message: "Type 2 must not have franchise or collection center" });
        }
      }

      if (type === 3) {
        if (!franchise) {
          return this.createError({ message: "Type 3 requires franchise" });
        }
        if (subBranch || collectionCenter) {
          return this.createError({ message: "Type 3 must not have sub branch or collection center" });
        }
      }

      if (type === 4) {
        if (!collectionCenter) {
          return this.createError({ message: "Type 4 requires collection center" });
        }
        if (subBranch || franchise) {
          return this.createError({ message: "Type 4 must not have sub branch or franchise" });
        }
      }
      return true;
    })
    .strict()
    .noUnknown();

  try {
    let obj = { ...body, type: Number(body?.type) };

    obj = existedValue(obj);

    if (obj.gender) {
      obj.gender = Number(obj.gender);
    }

    return await schema.validate(obj, { abortEarly: false });
  } catch (err) {
    return { error: err.errors[0] };
  }
};

export const MenuSchema = async (body, required = true) => {
  const schema = yup
    .object({
      name: dynamicRequire(
        yup
          .string()
          .matches(nameStartWithLetterRegex, "Name must start with a letter and contain at least one letter")
          .max(200, "Name must be below 200 characters"),
        required,
        "Name is required"
      ),
      masterPath: dynamicRequire(yup.boolean().typeError("Master path must be boolean"), required, "Master path is required"),
      link: yup.string().matches(/^\/[a-zA-Z0-9\-._~%!$&'()*+,;=:@\/]*$/, "Invalid path link"),

      icon: dynamicRequire(yup.string().max(20, "Icon must be below 20 characters"), required, "Icon is required"),
      order: yup.number().positive("Order must be a positive number"),
      module: dynamicRequire(yup.string().matches(objectIdRegex, "Invalid module"), required, "module is required"),
    })
    .strict()
    .noUnknown();

  try {
    let obj = existedValue({
      ...body,
      name: body?.name?.trim(),
      link: body?.link?.trim(),
    });

    if (obj.order) {
      obj.order = Number(obj.order);
    }
    return await schema.validate(obj, { abortEarly: false });
  } catch (err) {
    return { error: err.errors[0] };
  }
};

export const SubMenuSchema = async (body, required = true) => {
  const schema = yup
    .object({
      name: dynamicRequire(
        yup
          .string()
          .matches(nameStartWithLetterRegex, "Name must start with a letter and contain at least one letter")
          .max(200, "Name must be below 200 characters"),
        required,
        "Name is required"
      ),
      link: dynamicRequire(yup.string().matches(/^\/[a-zA-Z0-9\-._~%!$&'()*+,;=:@\/]*$/, "Invalid path link"), required, "Link is required"),
      masterPath: dynamicRequire(yup.boolean().typeError("Master path must be boolean"), required, "Master path is required"),
      icon: dynamicRequire(yup.string().max(20, "Icon must be below 20 characters"), required, "Icon is required"),
      order: yup.number().positive("order must be a positive number"),
      mainMenu: dynamicRequire(yup.string().matches(objectIdRegex, "Invalid main menu"), required, "Main menu is required"),
    })
    .strict()
    .noUnknown();

  try {
    let obj = existedValue({
      ...body,
      name: body?.name?.trim(),
      link: body?.link?.trim(),
    });

    if (obj.order) {
      obj.order = Number(obj.order);
    }

    return await schema.validate(obj, { abortEarly: false });
  } catch (err) {
    return { error: err.errors[0] };
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
        .matches(nameStartWithLetterRegex, "last name must start with a letter and contain at least one letter")
        .max(200, "lastName must be below 200 characters"),
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
    .strict()
    .noUnknown();

  try {
    let obj = { ...body };

    if (obj.gender) {
      obj.gender = Number(obj.gender);
    }

    return await schema.validate(obj, { abortEarly: false });
  } catch (err) {
    return { error: err.errors[0] };
  }
};