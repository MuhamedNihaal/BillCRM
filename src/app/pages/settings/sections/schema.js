import * as Yup from "yup";

export const changePassword = Yup.object().shape({
  currentPassword: Yup.string().trim().required("Current password is required"),
  newPassword: Yup.string()
    .trim()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters")
    .max(15, "Password must be at most 15 characters")
    .matches(/[A-Z]/, "Password must contain at least one uppercase letter")
    .matches(
      /[!@#$%^&*(),.?":{}|<>]/,
      "Password must contain at least one special character",
    ),
  confirmPassword: Yup.string()
    .trim()
    .oneOf([Yup.ref("newPassword"), null], "Passwords must match")
    .required("Please confirm your new password"),
});
