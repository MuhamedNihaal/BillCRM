import * as yup from "yup";
import { dynamicRequire, mobileWithLandPhone } from "@/helper/regex.js";
import { Error } from "express-error-catcher";

export const corporateSchema = async (body, required = true) => {
  const schema = yup
    .object({
      slab: yup.number().oneOf([1, 2, 3, 4], "only 1, 2, 3, or 4").required("slab number is required").typeError("slab must be number"),
      name: dynamicRequire(yup.string().max(200, "name must be below 200 characters"), required, "name is required"),
      mobile: dynamicRequire(yup.string().matches(mobileWithLandPhone, "Invalid mobile number"), required, "mobile is required"),
      email: yup.string().email().nullable().default(null),

      location: yup.string().max(200, "location must be below 200 characters").nullable().default(null),
      district: yup.string().max(200, "district must be below 200 characters").nullable().default(null),
      state: yup.number().max(200, "state must be below 200 characters").nullable().default(null),
    })
    .noUnknown();

  try {
    let obj = { ...body, name: body.name?.trim() };

    if (obj.state) {
      obj.state = Number(obj.state);
    }
    return await schema.validate(obj, { abortEarly: false, stripUnknown: false });
  } catch (err) {
    let message = Array.isArray(err.errors[0]) ? err.errors[0]?.message : err?.message;
    throw new Error(message, 400);
  }
};
