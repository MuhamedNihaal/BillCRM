import * as yup from "yup";
import { dynamicRequire, mobileWithLandPhone } from "./global.validation.js";
export const CorporativeSchema = async (body, required = true) => {
  const schema = yup
    .object({
      slab: yup
        .number()
        .oneOf([1, 2, 3, 4], "only 1, 2, 3, or 4")
        .required("slab number is required")
        .typeError("slab must be number"),
      name: dynamicRequire(
        yup.string().max(200, "name must be below 200 characters"),
        required,
        "name is required"
      ),
      mobile: dynamicRequire(
        yup.string().matches(mobileWithLandPhone, "Invalid mobile number"),
        required,
        "mobile is required"
      ),
      email: yup.string().email(),

      location: yup.string().max(200, "location must be below 200 characters"),
      district: yup.string().max(200, "district must be below 200 characters"),
      state: yup.number().max(200, "state must be below 200 characters"),
    })
    .strict()
    .noUnknown();

  try {
    return await schema.validate(
      { ...body, name: body.name?.trim() },
      { abortEarly: false }
    );
  } catch (err) {
    return { error: err.errors[0] };
  }
};
