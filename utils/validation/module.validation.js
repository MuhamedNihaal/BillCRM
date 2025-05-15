import * as yup from "yup";
import { dynamicRequire, objectIdRegex } from "./global.validation.js";

export const ModuleSchema = async (body, required = true) => {
  const schema = yup
    .object({
      type: dynamicRequire(
        yup
          .number()
          .typeError("type must be number")
          .oneOf([1, 2, 3], "type must be 1, 2, or 3"),
        required,
        "type is required"
      ),
      id: dynamicRequire(
        yup
          .string()
          .typeError("invalid id format provided")
          .matches(objectIdRegex, "invalid id format provided"),
        required,
        "id is required"
      ),
      privilegeId: dynamicRequire(
        yup
          .string()
          .typeError("invalid privilege id format provided")
          .matches(objectIdRegex, "invalid privilege id format provided"),
        required,
        "privilege is required"
      ),
      mainMenu: yup
        .string()
        .typeError("invalid main menu id format provided")
        .matches(objectIdRegex, "invalid main menu id format provided"),

      module: yup
        .string()
        .typeError("invalid module id format provided")
        .matches(objectIdRegex, "invalid module id format provided"),

      create: yup.boolean().typeError("create must be boolean"),
      view: yup.boolean().typeError("view must be boolean"),
      edit: yup.boolean().typeError("edit must be boolean"),
      remv: yup.boolean().typeError("remv must be boolean"),
      status: yup.boolean().typeError("status must be boolean"),
    })
    .test(
      "conditional-validation",
      "Invalid fields for given type",
      (values) => {
        const { type, status, create, view, edit, remv, module, mainMenu } =
          values;

        if (type === 1) {
          if (status === undefined) return false;
          if (create || view || edit || remv || module || mainMenu)
            return false;
        } else if (type === 2) {
          // if (!create || !view || !edit || !remv || !module) return false;
          if (mainMenu || status) return false;
        } else if (type === 3) {
          // if (!create || !view || !edit || !remv || !mainMenu) return false;
          if (module || status) return false;
        }
        return true;
      }
    )
    .strict()
    .noUnknown();

  try {
    return await schema.validate(
      { ...body, type: Number(body?.type) },
      { abortEarly: false }
    );
  } catch (err) {
    return { error: err.errors[0] ?? err?.message };
  }
};
