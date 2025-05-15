import * as yup from "yup";
import { dynamicRequire, objectIdRegex, nameStartWithLetterRegex } from "./global.validation.js";

export const TestBundleSchema = async (body, required = true) => {
  const schema = yup
    .object({
      test: yup.string().matches(objectIdRegex, "invalid test provided").required("test is required"),
      testType: yup.number().oneOf([2, 3, 4, 5, 6], "invalid test type").required("test type is required"),

      antibiotics: yup.string().matches(objectIdRegex, "invalid antibiotics provided"),
      antibioticsStatus: yup.boolean(),

      sample: yup.string().matches(objectIdRegex, "invalid antibiotics provided"),
      sampleStatus: yup.boolean(),

      pointer: yup.string().matches(objectIdRegex, "invalid pointer provided"),
      pointerType: yup
        .number()
        .when("testType", {
          is: 2,
          then: (schema) => schema.oneOf([1], "pointer type must be 1 when test type is 2"),
        })
        .when("testType", {
          is: 3,
          then: (schema) => schema.oneOf([1, 2, 6], "pinter type must be 1, 2 or 6 when test type is 3"),
        })
        .oneOf([1, 2, 6], "invalid pointer type"),
    })
    .test("exclusive-condition", "must provide valid format", (obj) => {
      const sets = [
        obj.antibiotics && typeof obj.antibioticsStatus === "boolean",
        obj.sample && typeof obj.sampleStatus === "boolean",
        obj.pointer && typeof obj.pointerType === "number",
      ];

      const validCount = sets.filter(Boolean).length;

      return validCount === 1;
    })
    .strict()
    .noUnknown();

  try {
    let obj = { ...body };

    if (obj.testType) {
      obj.testType = Number(obj.testType);
    }
    if (obj.pointerType) {
      obj.pointerType = Number(obj.pointerType);
    }

    return await schema.validate(obj, { abortEarly: false });
  } catch (err) {
    return { error: err.errors[0] };
  }
};

export const TestSchema = async (body, required = true) => {
  const schema = yup
    .object({
      name: dynamicRequire(
        yup.string().matches(nameStartWithLetterRegex, "name must start with a letter").max(200, "name must be below 200 characters"),
        required,
        "name is required"
      ),
      department: dynamicRequire(yup.string().matches(objectIdRegex, "invalid department id"), required, "department is required"),
      method: dynamicRequire(yup.string().matches(objectIdRegex, "invalid method id"), required, "method is required"),
      unit: dynamicRequire(yup.string().matches(objectIdRegex, "invalid unit id"), required, "invalid unit id provided"),
      duration: yup.number().typeError("duration must be number").positive("duration must be a positive number"),
      shortCode: yup.string().max(80, "short code must be below 80 characters"),
      targetMachine: yup.string().matches(objectIdRegex, "invalid target machine id"),

      price: dynamicRequire(
        yup.number().typeError("price must be number").positive("price must be a positive number"),
        required,
        "price is required"
      ),
      cost: dynamicRequire(yup.number().typeError("cost must be number").positive("cost must be a positive number"), required, "cost is required"),

      analysisType: yup.string().matches(objectIdRegex, "invalid analysis type id"),

      branchPrice: yup
        .array()
        .of(
          yup
            .object()
            .shape({
              branch: yup.string().matches(objectIdRegex, "invalid branch id in the branch price"),
              price: yup
                .number()
                .typeError("price must be a number in the branch price")
                .positive("price must be a positive number in the branch price"),
            })
            .typeError("provide object in branch price")
        )
        .typeError("branch price must be array of object"),
      // slab: yup
      //   .array()
      //   .of(
      //     yup
      //       .number()
      //       .typeError("array value must be number")
      //       .required("price is required")
      //   )
      //   .typeError("slab is array of number value"),
      specificSlab: yup
        .array()
        .of(
          yup
            .object()
            .shape({
              corporate: yup.string().matches(objectIdRegex, "invalid corporate in the slab"),
              price: yup
                .number()
                .typeError("price must be a number in the corporate slab")
                .positive("price must be a positive number in the corporate slab"),
            })
            .typeError("provide a object in corporate slab")
        )
        .typeError("corporate slab price must be array of object"),
      slabs: yup
        .array()
        .of(
          yup
            .object()
            .shape({
              slab: yup.number().oneOf([1, 2, 3, 4], "only support 1, 2, 3 or 4").typeError("slab must be number"),
              price: yup.number().typeError("price must be a number in the slab").positive("price must be a positive number in the slab"),
            })
            .typeError("provide a object in slab")
        )
        .typeError("slab must be array of object"),
      individual: yup.boolean().typeError("individual must be boolean"),
      graph: yup.boolean().typeError("graph must be boolean"),
      fasting: yup.boolean().typeError("fasting must be boolean"),
      services: yup.boolean().typeError("service must be boolean"),
      outSource: yup.boolean().typeError("out source must be boolean"),
      outSourceLab: yup
        .string()
        .matches(objectIdRegex, "invalid out source lab id")
        .when("outSource", {
          is: true,
          then: (schema) => schema.required("out source lab is required when outSource is true"),
          otherwise: (schema) => schema.notRequired(),
        }),
      description: yup.string().max(1000, "description must be below 1000 chareacters"),
      referenceRange: dynamicRequire(
        yup.number().oneOf([0, 1, 2, 3], "reference must be 0, 1, 2, or 3").typeError("reference must be number"),
        required,
        "reference range is required"
      ),
      assignBranch: yup.array().of(yup.string().matches(objectIdRegex, "invalid branch id provided")).typeError("provide array of branch ids"),
      referenceRanges: yup.array().of(
        yup.object().shape({
          gender: yup.number().oneOf([1, 2], "only 1, 2").typeError("gender must be number"),
          ageFrom: yup.number().positive("age from must be positive").typeError("age from must be number"),
          ageTo: yup.number().positive("age to must be positive").typeError("age to must be number"),
          value: yup.number().typeError("value must be number"),
          lessThan: yup.number().typeError("less than must be number"),
          greaterThan: yup.number().typeError("greater than must be number"),
          from: yup.number().typeError("from must be number"),
          to: yup.number().typeError("to must be number"),

          parametric: yup.string().matches(objectIdRegex, "invalid parametric id"),
          rangeType: yup.number().typeError("range type must be number").oneOf([1, 2, 3], "range type must be 1, 2, or 3"),
        })
      ),
      consumables: yup
        .array()
        .of(
          yup
            .object()
            .shape({
              consumable: yup.string().matches(objectIdRegex, "invalid consumable in the consumables"),
              unit: yup.number().typeError("unit must be number").positive("unit must be a positive number in the consumables"),
            })
            .typeError("provide object in consumable")
        )
        .typeError("consumable must be an array of object"),
    })
    .strict()
    .noUnknown();

  try {
    return await schema.validate(body, { abortEarly: false });
  } catch (err) {
    return { error: err.errors[0] };
  }
};

export const GroupSchema = async (body, required = true) => {
  const schema = yup
    .object({
      name: dynamicRequire(
        yup.string().matches(nameStartWithLetterRegex, "name must start with a letter").max(200, "name must be below 200 characters"),
        required,
        "name is required"
      ),

      duration: yup.number().typeError("duration must be number").positive("duration must be a positive number"),
      shortCode: yup.string().max(80, "short code must be below 80 characters"),

      price: dynamicRequire(
        yup.number().typeError("price must be number").positive("price must be a positive number"),
        required,
        "price is required"
      ),
      cost: dynamicRequire(yup.number().typeError("cost must be number").positive("cost must be a positive number"), required, "cost is required"),

      branchPrice: yup
        .array()
        .of(
          yup
            .object()
            .shape({
              branch: yup.string().matches(objectIdRegex, "invalid branch id in the branch price"),
              price: yup
                .number()
                .typeError("price must be a number in the branch price")
                .positive("price must be a positive number in the branch price"),
            })
            .typeError("provide object in branch price")
        )
        .typeError("branch price must be array of object"),

      specificSlab: yup
        .array()
        .of(
          yup
            .object()
            .shape({
              corporate: yup.string().matches(objectIdRegex, "invalid corporate in the slab"),
              price: yup
                .number()
                .typeError("price must be a number in the corporate slab")
                .positive("price must be a positive number in the corporate slab"),
            })
            .typeError("provide a object in corporate slab")
        )
        .typeError("corporate slab price must be array of object"),
      slabs: yup
        .array()
        .of(
          yup
            .object()
            .shape({
              slab: yup.number().typeError("slab must be number"),
              price: yup.number().typeError("price must be a number in the slab").positive("price must be a positive number in the slab"),
            })
            .typeError("provide a object in slab")
        )
        .typeError("corporate slab price must be array of object"),
      investigation: yup.boolean().typeError("individual must be boolean"),

      description: yup.string().max(1000, "description must be below 1000 chareacters"),
    })
    .strict()
    .noUnknown();

  try {
    return await schema.validate(body, { abortEarly: false });
  } catch (err) {
    return { error: err.errors[0] };
  }
};

export const PackageSchema = async (body, required = true) => {
  const schema = yup
    .object({
      name: dynamicRequire(
        yup.string().matches(nameStartWithLetterRegex, "name must start with a letter").max(200, "name must be below 200 characters"),
        required,
        "name is required"
      ),

      duration: yup.number().typeError("duration must be number").positive("duration must be a positive number"),
      shortCode: yup.string().max(80, "short code must be below 80 characters"),

      price: dynamicRequire(
        yup.number().typeError("price must be number").positive("price must be a positive number"),
        required,
        "price is required"
      ),
      cost: dynamicRequire(yup.number().typeError("cost must be number").positive("cost must be a positive number"), required, "cost is required"),

      branchPrice: yup
        .array()
        .of(
          yup
            .object()
            .shape({
              branch: yup.string().matches(objectIdRegex, "invalid branch id in the branch price"),
              price: yup
                .number()
                .typeError("price must be a number in the branch price")
                .positive("price must be a positive number in the branch price"),
            })
            .typeError("provide object in branch price")
        )
        .typeError("branch price must be array of object"),

      specificSlab: yup
        .array()
        .of(
          yup
            .object()
            .shape({
              corporate: yup.string().matches(objectIdRegex, "invalid corporate in the slab"),
              price: yup
                .number()
                .typeError("price must be a number in the corporate slab")
                .positive("price must be a positive number in the corporate slab"),
            })
            .typeError("provide a object in corporate slab")
        )
        .typeError("corporate slab price must be array of object"),
      slabs: yup
        .array()
        .of(
          yup
            .object()
            .shape({
              slab: yup.number().typeError("slab must be number"),
              price: yup.number().typeError("price must be a number in the slab").positive("price must be a positive number in the slab"),
            })
            .typeError("provide a object in slab")
        )
        .typeError("corporate slab price must be array of object"),

      description: yup.string().max(1000, "description must be below 1000 chareacters"),
    })
    .strict()
    .noUnknown();

  try {
    return await schema.validate(body, { abortEarly: false });
  } catch (err) {
    return { error: err.errors[0] };
  }
};

export const CultureSchema = async (body, required = true) => {
  const schema = yup
    .object({
      name: dynamicRequire(
        yup.string().matches(nameStartWithLetterRegex, "name must start with a letter").max(200, "name must be below 200 characters"),
        required,
        "name is required"
      ),

      department: dynamicRequire(yup.string().matches(objectIdRegex, "invalid department id"), required, "department is required"),

      duration: yup.number().typeError("duration must be number").positive("duration must be a positive number"),
      shortCode: yup.string().max(80, "short code must be below 80 characters"),

      price: dynamicRequire(
        yup.number().typeError("price must be number").positive("price must be a positive number"),
        required,
        "price is required"
      ),
      cost: dynamicRequire(yup.number().typeError("cost must be number").positive("cost must be a positive number"), required, "cost is required"),

      outSource: yup.boolean().typeError("out source must be boolean"),
      outSourceLab: yup
        .string()
        .matches(objectIdRegex, "invalid out source lab id")
        .when("outSource", {
          is: true,
          then: (schema) => schema.required("out source lab is required when outSource is true"),
          otherwise: (schema) => schema.notRequired(),
        }),

      branchPrice: yup
        .array()
        .of(
          yup
            .object()
            .shape({
              branch: yup.string().matches(objectIdRegex, "invalid branch id in the branch price"),
              price: yup
                .number()
                .typeError("price must be a number in the branch price")
                .positive("price must be a positive number in the branch price"),
            })
            .typeError("provide object in branch price")
        )
        .typeError("branch price must be array of object"),

      specificSlab: yup
        .array()
        .of(
          yup
            .object()
            .shape({
              corporate: yup.string().matches(objectIdRegex, "invalid corporate in the slab"),
              price: yup
                .number()
                .typeError("price must be a number in the corporate slab")
                .positive("price must be a positive number in the corporate slab"),
            })
            .typeError("provide a object in corporate slab")
        )
        .typeError("corporate slab price must be array of object"),

      slabs: yup
        .array()
        .of(
          yup
            .object()
            .shape({
              slab: yup.number().typeError("slab must be number"),
              price: yup.number().typeError("price must be a number in the slab").positive("price must be a positive number in the slab"),
            })
            .typeError("provide a object in slab")
        )
        .typeError("corporate slab price must be array of object"),
      description: yup.string().max(1000, "description must be below 1000 chareacters"),
    })
    .strict()
    .noUnknown();

  try {
    return await schema.validate(body, { abortEarly: false });
  } catch (err) {
    return { error: err.errors[0] };
  }
};

export const ExaminationSchema = async (body, required = true) => {
  const schema = yup
    .object({
      name: dynamicRequire(
        yup.string().matches(nameStartWithLetterRegex, "name must start with a letter").max(200, "name must be below 200 characters"),
        required,
        "name is required"
      ),

      department: dynamicRequire(yup.string().matches(objectIdRegex, "invalid department id"), required, "department is required"),

      duration: yup.number().typeError("duration must be number").positive("duration must be a positive number"),
      shortCode: yup.string().max(80, "short code must be below 80 characters"),

      price: dynamicRequire(
        yup.number().typeError("price must be number").positive("price must be a positive number"),
        required,
        "price is required"
      ),
      cost: dynamicRequire(yup.number().typeError("cost must be number").positive("cost must be a positive number"), required, "cost is required"),

      branchPrice: yup
        .array()
        .of(
          yup
            .object()
            .shape({
              branch: yup.string().matches(objectIdRegex, "invalid branch id in the branch price"),
              price: yup
                .number()
                .typeError("price must be a number in the branch price")
                .positive("price must be a positive number in the branch price"),
            })
            .typeError("provide object in branch price")
        )
        .typeError("branch price must be array of object"),

      specificSlab: yup
        .array()
        .of(
          yup
            .object()
            .shape({
              corporate: yup.string().matches(objectIdRegex, "invalid corporate in the slab"),
              price: yup
                .number()
                .typeError("price must be a number in the corporate slab")
                .positive("price must be a positive number in the corporate slab"),
            })
            .typeError("provide a object in corporate slab")
        )
        .typeError("corporate slab price must be array of object"),
      slabs: yup
        .array()
        .of(
          yup
            .object()
            .shape({
              slab: yup.number().typeError("slab must be number"),
              price: yup.number().typeError("price must be a number in the slab").positive("price must be a positive number in the slab"),
            })
            .typeError("provide a object in slab")
        )
        .typeError("corporate slab price must be array of object"),
      description: yup.string().max(1000, "description must be below 1000 chareacters"),
    })
    .strict()
    .noUnknown();

  try {
    return await schema.validate(body, { abortEarly: false });
  } catch (err) {
    return { error: err.errors[0] };
  }
};
