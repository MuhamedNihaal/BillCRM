import * as yup from "yup";

export const AddPurchaseSchema = yup.object().shape({
    supplier: yup
    .string()
    .required("Supplier is required"),
    // supplierAddress: yup
    // .string()
    // .required("Supplier Address is required"),
    // supplierState: yup
    // .string()
    // .required("Supplier State is required"),
    // supplierGstin: yup
    // .string()
    // .required("Supplier GST is required"),
    billDate: yup
    .string()
    .required("Bill Date is required"),
    billNum: yup
    .string()
    .required("Bill Number is required")
    .matches(/^[a-zA-Z0-9/-]+$/, "Bill Number is invalid"),
});