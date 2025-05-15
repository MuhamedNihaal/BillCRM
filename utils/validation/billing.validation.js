import * as yup from "yup";
import { dateRex, objectIdRegex, timeRex } from "./global.validation.js";
import { existedValue } from "../../helper/functions.js";
export const discountRequestSchema = async (body, required = true) => {
  const schema = yup
    .object({
      uniqueId: yup.string().required("please provide uniqueId"),
      key: yup.string().required("tab key is required"),
      patient: yup.string().matches(objectIdRegex, "please select patient"),
      total: yup
        .number()
        .required("total amount is required")
        .typeError("total must be number"),
      offerCode: yup.string(),
      discount: yup.number().typeError("discount must be number"),
      adjAmount: yup
        .number()
        .required("adj amount is required")
        .typeError("adj amount must be number"),
      grandTotal: yup
        .number()
        .required("grand total is required")
        .typeError("grand total must be number"),
    })
    .strict()
    .noUnknown();

  try {
    let obj = { ...body };
    obj.total = Number(obj.total);
    obj.adjAmount = Number(obj.adjAmount);
    obj.grandTotal = Number(obj.grandTotal);
    if (obj.discount) {
      obj.discount = Number(obj.discount);
    }
    return existedValue(await schema.validate(obj, { abortEarly: false }));
  } catch (err) {
    return { error: err.errors[0] };
  }
};

export const billingSchema = async (body, required = true) => {
  let blockedFields = [
    "updatedBy",
    "addedBy",
    "time",
    "date",
    "__v",
    "branch",
    "subBranch",
    "franchise",
    "branchType",
  ];

  const schema = yup
    .object({
      uniqueId: yup.string().required("please provide uniqueId"),
      patient: yup
        .string()
        .matches(objectIdRegex, "invalid patient id provided")
        .required("patient id is required"),
      doctor: yup.string().matches(objectIdRegex, "invalid doctor id provided"),
      corporate: yup
        .string()
        .matches(objectIdRegex, "invalid corporate id provided"),
      hospital: yup
        .string()
        .matches(objectIdRegex, "invalid hospital id provided"),
      tests: yup
        .array()
        .of(
          yup.object({
            test: yup
              .string()
              .matches(objectIdRegex, "invalid test id provided")
              .required("test id is required"),
            amount: yup
              .number()
              .required("amount is required")
              .typeError("amount must be number"),
            reportDate: yup
              .string()
              .matches(
                dateRex,
                "invalid report date format (expected YYYY-MM-DD)"
              )
              .required("report date is required"),
            reportTime: yup
              .string()
              .matches(timeRex, "invalid report time format (expected HH:mm)")
              .required("report time is required"),
          })
        )
        .required("tests are required")
        .min(1, "at least one test is required"),
      paymentMode: yup
        .array()
        .of(
          yup.object({
            mode: yup
              .number()
              .oneOf([1, 2, 3, 4, 5], "invalid payment mode (expected 1 to 5)")
              .required("payment mode is required"),
            value: yup
              .number()
              .required("amount is required")
              .typeError("amount must be number"),
            name: yup.string(),
          })
        )
        .required("payment mode are required")
        .min(1, "at least one payment mode is required"),
      total: yup
        .number()
        .required("total amount is required")
        .typeError("total must be number"),
      receivedAmount: yup
        .number()
        .required("received amount is required")
        .typeError("received amount must be number"),
      totalDiscount: yup.number().typeError("total discount must be number"),
      adjAmount: yup
        .number()
        .required("adj amount is required")
        .typeError("adj amount must be number"),
      grandTotal: yup
        .number()
        .required("grand total is required")
        .typeError("grand total must be number"),
      opNumber: yup.string(),
      ipNumber: yup.string(),
      discount: yup.number().typeError("discount must be number"),
      discountDetails: yup.object({
        status: yup
          .number()
          .oneOf([1, 2, 3, 4], "invalid status (expected 1 to 4)"),
        time: yup.string(),
      }),
      offerDiscountInfo: yup.object({
        _id: yup.string().matches(objectIdRegex, "invalid id provided"),
        type: yup.number().oneOf([0, 1], "invalid type (expected 0 or 1)"),
        amountOfPercentage: yup
          .number()
          .typeError("amount of percentage must be number"),
        code: yup.string(),
        name: yup.string(),
        maxLimit: yup.number().typeError("max limit must be number"),
        allotedAmount: yup.number().typeError("alloted amount must be number"),
        availedAmount: yup.number().typeError("availed amount must be number"),
        status: yup.number(),
      }),
      offercode: yup.string(),
      discountAmount: yup.number().typeError("discount amount must be number"),
      offerDiscount: yup
        .number()
        .typeError("offer discount amount must be number"),
      availableOfferCodeDiscount: yup
        .number()
        .typeError("discount amount must be number"),
    })
    .test("no-blocked-fields", "Some fields are not allowed", function (value) {
      if (!value || typeof value !== "object") return true;
      for (const field of blockedFields) {
        if (field in value) {
          return this.createError({
            path: field,
            message: `${field} is not allowed`,
          });
        }
      }
      return true;
    });

  try {
    let obj = existedValue(body);

    delete obj.time;
    delete obj.date;

    return await schema.validate(obj, { abortEarly: false });
  } catch (err) {
    return { error: err.errors[0] };
  }
};
