import * as yup from "yup";
import { Error } from "express-error-catcher";
import { v4 as uuidv4 } from "uuid";

export const loginSchema = async (body) => {
  let uuid = uuidv4();

  const schema = yup
    .object({
      username: yup.string().required("Username is required").max(150, "Username must be below 150 characters"),
      password: yup.string().required("Password is required").max(20, "Password must be below 20 characters"),
      deviceId: yup.string().max(500, "Device ID must be below 500 characters").default(uuid),
      rememberMe: yup.boolean().default(false),
    })
    .noUnknown();

  try {
    return await schema.validate(body, { abortEarly: false, stripUnknown: false });
  } catch (error) {
    let message = Array.isArray(error.errors) ? error.errors[0] : error?.message;
    throw new Error(message, 400);
  }
};

export const changePasswordSchema = async (body) => {
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
  } catch (error) {
    let message = Array.isArray(error.errors) ? error.errors[0] : error?.message;
    throw new Error(message, 400);
  }
};
