import * as yup from "yup";

export const moduleSchema = yup.object({
  name: yup.string().required("Name is required"),
  code: yup.string().required("Code is required"),
  icon: yup.string().required("Icon is required"),
  redirectUrl: yup.string().required("Redirect Url is required"),
});