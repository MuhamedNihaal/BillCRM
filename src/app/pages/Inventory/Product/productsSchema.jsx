import * as yup from "yup";

export const productsSchema = yup.object().shape({
  name: yup
    .string()
    .trim()
    .required("Name is required")
    .min(3, "Name must be at least 3 characters"),
  mrp: yup
    .string()
    .required("MRP is required")
    .matches(/^\d+(\.\d{1,2})?$/, "MRP must be a price value"),
  specialPrice: yup
    .string()
    .required("Special Price is required")
    .matches(/^\d+(\.\d{1,2})?$/, "Special Price must be a price value")
    .test(
      "special-price-check",
      "Special Price cannot be greater than MRP",
      function (value) {
        const { mrp } = this.parent;
        if (value && mrp) {
          return parseFloat(value) <= parseFloat(mrp);
        }
        return true;
      },
    ),
  gst: yup.string().required("GST is required"),
  cost: yup.string().required("Cost is required"),
  primaryUnit: yup.string().required("Primary Unit is required"),
});
