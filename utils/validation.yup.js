import * as yup from "yup";
import { existedValue } from "../helper/functions.js";

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

const objectIdRegex = /^[0-9a-fA-F]{24}$/;
const nameStartWithLetterRegex = /^[A-Za-z].*$/;
const mobileRegex = /^[6-9]\d{9}$/;
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const dynamicRequire = (schema, required, message) => (required ? schema.required(message) : schema);

export const userSchema = async (body, required = true) => {
  const schema = yup
    .object({
      type: dynamicRequire(yup.number().oneOf([1, 2, 3, 4, 5], "type must be 1, 2, 3, 4, or 5").typeError("type must be number"), required, "type is required"),
      branch: yup.string().matches(objectIdRegex, "invalid branch id provided").typeError("branch must be string"),
      company: yup.string().matches(objectIdRegex, "invalid company id provided").typeError("branch must be string"),
      collectionCenter: yup.string().matches(objectIdRegex, "invalid collection center id provided").typeError("collection center id must be string"),

      firstName: dynamicRequire(
        yup.string().matches(nameStartWithLetterRegex, "first name must start with a letter and contain at least one letter").max(200, "firstName must be below 200 characters"),
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
        yup.string().matches(nameStartWithLetterRegex, "username must start with a letter and contain at least one letter").max(150, "username must be below 150 characters"),
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
      const { collectionCenter, branch, company, type } = values;

      if (type === 1 || type === 2 || type === 3) {
        if (branch === undefined) return false;

        if (company || collectionCenter) return false;
      }

      if (type === 4) {
        if (collectionCenter === undefined) return false;

        if (branch || company) return false;
      }

      if (type === 5) {
        if (company === undefined) return false;

        if (branch || collectionCenter) return false;
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

export const DoctorSchema = async (body, required = true) => {
  const schema = yup
    .object({
      name: dynamicRequire(yup.string().max(200, "Name must be below 200 characters"), required, "Name is required"),
      mobile: dynamicRequire(yup.string().matches(/^(\+?\d{1,3}[- ]?)?[6-9]\d{9}$/, "Invalid mobile number"), required, "Mobile is required"),
      email: yup.string().email(),

      specialization: yup
        .array()
        .of(yup.string().required("Specialization is required").max(20, "Each label support max 20 character"))
        .typeError("Must be provide array of string in specialization"),
      hospital: dynamicRequire(
        yup
          .array()
          .of(yup.string().matches(objectIdRegex, "Invalid hospital provided").required("Hospital is required"))
          .min(1, "At least one hospital is required")
          .typeError("Must be provide array of in hospital"),
        required,
        "Hospital is required"
      ),
    })
    .strict()
    .noUnknown();

  try {
    return await schema.validate(body, { abortEarly: false });
  } catch (err) {
    return { error: err.errors[0] };
  }
};

export const HospitalSchema = async (body, required = true) => {
  const schema = yup
    .object({
      name: dynamicRequire(yup.string().max(200, "Name must be below 200 characters"), required, "Name is required"),
      mobile: dynamicRequire(yup.string().matches(/^(\+?\d{1,3}[- ]?)?[6-9]\d{9}$/, "Invalid mobile number"), required, "Mobile is required"),
      email: yup.string().email(),

      location: yup.string().max(200, "Location must be below 200 characters"),
      district: yup.string().max(200, "District must be below 200 characters"),
      state: yup.number().max(200, "State must be below 200 characters"),
    })
    .strict()
    .noUnknown();

  try {
    return await schema.validate(body, { abortEarly: false });
  } catch (err) {
    return { error: err.errors[0] };
  }
};

export const TestExaminationSchema = async (body, required = true) => {
  const schema = yup
    .object({
      name: dynamicRequire(yup.string().max(200, "name must be below 200 characters"), required, "name is required"),
      duration: dynamicRequire(yup.number().positive("duration must be a positive number"), required, "duration is required"),
      code: dynamicRequire(yup.string().max(80, "short code must be below 80 characters"), required, "short code is required"),
      price: dynamicRequire(yup.number().positive("price must be a positive number"), required, "price is required"),
      groupPrice: yup.array().of(
        yup.object().shape({
          branch: yup.string().matches(objectIdRegex, "invalid branch id in the branch price").required("branch is required in the group price"),
          price: yup.number().positive("price must be a positive number in the branch price").required("price is required in the branch price"),
        })
      ),
      slab: yup.array().of(yup.number().typeError("must be number").required("price required")),
      specificSlab: yup.array().of(
        yup.object().shape({
          corporate: yup.string().matches(objectIdRegex, "invalid corporate in the slab").required("corporate is required in the slab"),
          price: yup.number().positive("price must be a positive number in the slab").required("price is required in the slab"),
        })
      ),
      investigation: yup.boolean().typeError("investigation must be boolean"),
      details: yup.string().max("200", "name must be below 200 characters"),
    })
    .strict()
    .noUnknown();

  try {
    return await schema.validate(body, { abortEarly: false });
  } catch (err) {
    return { error: err.errors[0] };
  }
};

export const MenuSchema = async (body, required = true) => {
  const schema = yup
    .object({
      name: dynamicRequire(
        yup.string().matches(nameStartWithLetterRegex, "Name must start with a letter and contain at least one letter").max(200, "Name must be below 200 characters"),
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
        yup.string().matches(nameStartWithLetterRegex, "Name must start with a letter and contain at least one letter").max(200, "Name must be below 200 characters"),
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

export const CompanySchema = async (body, required = true) => {
  const schema = yup
    .object({
      name: dynamicRequire(yup.string(), required, "Name is required"),
      logo: dynamicRequire(yup.string(), required, "Logo is required"),
      mobile: dynamicRequire(yup.string().matches(mobileRegex, "Invalid mobile number"), required, "Mobile is required"),
      email: dynamicRequire(yup.string().matches(emailRegex, "Invalid email"), required, "Email is required"),
      contactPerson: dynamicRequire(yup.string(), required, "Contact Person is required"),
      address: dynamicRequire(yup.string(), required, "Address is required"),
    })
    .strict();

  try {
    return await schema.validate(
      {
        ...body,
        name: body?.name?.trim(),
      },
      { abortEarly: false }
    );
  } catch (err) {
    return { error: err.errors[0] };
  }
};

export const purchaseBodyValidation = async (body) => {
  const schema = yup.object().shape({
    supplier: yup.mixed().required("Supplier is required"),
    billNum: yup.mixed().required("Bill Number is required"),
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
          sku: yup.string().required("SKU is required"),
          quantity: yup.number().required("Quantity is required"),
          unit: yup.number().required("Unit is required"),
          mrp: yup.number().required("MRP is required"),
          rate: yup.number().required("Rate is required"),
          gst: yup.number().required("GST is required"),
          amount: yup.number().required("Amount is required"),
        })
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
          scgstPercentage: yup.number().required("SCGST Percentage is required"),
          scgstAmount: yup.number().required("SCGST Amount is required"),
        })
      )
      .required("GST is required"),
  });
  try {
    return await schema.validate(body, { abortEarly: false });
  } catch (err) {
    return { error: err.errors[0] };
  }
};
