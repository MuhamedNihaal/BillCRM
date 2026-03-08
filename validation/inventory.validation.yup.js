import { dynamicRequire, mobileOnly } from "@/helper/regex.js";
import * as yup from "yup";

export const purchaseBodyValidation = async (
  body,
  existingBillNumbers = [],
) => {
  const schema = yup.object().shape({
    supplier: yup.mixed().required("Supplier is required"),
    billNum: yup
      .mixed()
      .required("Bill Number is required")
      .test(
        "unique-bill-number",
        "Bill Number already exists",
        function (value) {
          if (!value) return true;
          return !existingBillNumbers.includes(value);
        },
      ),
    billDate: yup.mixed().required("Bill Date is required"),
    totalAmount: yup.number().required("Total Amount is required"),
    taxableAmount: yup.number().required("Taxable Amount is required"),
    grandTotal: yup.number().required("Grand Total is required"),
    attachment: yup.mixed(), // Optional
    items: yup
      .array()
      .of(
        yup.object().shape({
          product: yup.string().required("Product is required"),
          quantity: yup.number().required("Quantity is required"),
          unit: yup.number().required("Unit is required"),
          mrp: yup.number().required("MRP is required"),
          rate: yup.number().required("Rate is required"),
          gst: yup.number().required("GST is required"),
          amount: yup.number().required("Amount is required"),
        }),
      )
      .required("Product is required"),
    gst: yup
      .array()
      .of(
        yup.object().shape({
          percentage: yup.string().required("GST Percentage is required"),
          amount: yup.string().required("GST Amount is required"),
          cgstPercentage: yup.number().required("CGST Percentage is required"),
          cgstAmount: yup.number().required("CGST Amount is required"),
          scgstPercentage: yup
            .number()
            .required("SCGST Percentage is required"),
          scgstAmount: yup.number().required("SCGST Amount is required"),
        }),
      )
      .required("GST is required"),
  });
  try {
    return await schema.validate(body, { abortEarly: false });
  } catch (err) {
    return { error: err.errors[0] };
  }
};

export const supplierSchema = async (
  body,
  existingMobiles = [],
  existingEmails = [],
  required = true,
) => {
  const schema = yup
    .object({
      name: dynamicRequire(
        yup.string().max(200, "Name must be below 200 characters"),
        required,
        "Name is required",
      ),
      company: yup.string().required("Company is required"),
      mobile: dynamicRequire(
        yup
          .string()
          .matches(mobileOnly, "Invalid mobile number")
          .test(
            "unique-mobile",
            "Mobile number already exists",
            function (value) {
              if (!value) return true;
              return !existingMobiles.includes(value);
            },
          ),
        required,
        "Mobile is required",
      ),
      email: yup
        .string()
        .email()
        .nullable()
        .test("unique-email", "Email already exists", function (value) {
          if (!value) return true;
          return !existingEmails.includes(value);
        }),
      state: yup.string().required("State is required"),
      gstIn: yup.string().required("GST is required"),
    })
    .strict();
  // .noUnknown();

  try {
    return await schema.validate(body, { abortEarly: false });
  } catch (err) {
    return { error: err.errors[0] };
  }
};
