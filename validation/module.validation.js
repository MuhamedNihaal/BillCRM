import * as yup from "yup";
import { Error } from "express-error-catcher";
import { dynamicRequire, objectIdRegex } from "@/helper/regex.js";

export const ModuleSchema = async (body, required = true) => {
  const schema = yup
    .object({
      type: dynamicRequire(yup.number().typeError("type must be number").oneOf([1, 2, 3], "type must be 1, 2, or 3"), required, "type is required"),
      id: dynamicRequire(
        yup.string().typeError("invalid id format provided").matches(objectIdRegex, "invalid id format provided"),
        required,
        "id is required"
      ),
      privilegeId: dynamicRequire(
        yup.string().typeError("invalid privilege id format provided").matches(objectIdRegex, "invalid privilege id format provided"),
        required,
        "privilege is required"
      ),
      mainMenu: yup.string().typeError("invalid main menu id format provided").matches(objectIdRegex, "invalid main menu id format provided"),

      module: yup.string().typeError("invalid module id format provided").matches(objectIdRegex, "invalid module id format provided"),

      create: yup.boolean().typeError("create must be boolean"),
      view: yup.boolean().typeError("view must be boolean"),
      edit: yup.boolean().typeError("edit must be boolean"),
      remv: yup.boolean().typeError("remv must be boolean"),
      status: yup.boolean().typeError("status must be boolean"),
    })
    .test("conditional-validation", "Invalid fields for given type", (values) => {
      const { type, status, create, view, edit, remv, module, mainMenu } = values;

      if (type === 1) {
        if (status === undefined) return false;
        if (create || view || edit || remv || module || mainMenu) return false;
      } else if (type === 2) {
        // if (!create || !view || !edit || !remv || !module) return false;
        if (mainMenu || status) return false;
      } else if (type === 3) {
        // if (!create || !view || !edit || !remv || !mainMenu) return false;
        if (module || status) return false;
      }
      return true;
    })
    .strict()
    .noUnknown();

  try {
    return await schema.validate({ ...body, type: Number(body?.type) }, { abortEarly: false });
  } catch (err) {
    return { error: err.errors[0] ?? err?.message };
  }
};

export const ruleSchema = async (body) => {
  const schema = yup
    .object({
      // 1 module enable or disable
      // 2 menu enable or disable
      // 3 sub menu enable or disable
      // 4 enable all

      type: yup.number().typeError("Type must be number").oneOf([1, 2, 3, 4], "Type must be 1, 2, 3 or 4").required("Type is required"),
      privilegeId: yup.string().typeError("Privilege must be string").matches(objectIdRegex, "Invalid privilege").required("Privilege is required"),

      moduleId: yup.string().typeError("Module must be string").matches(objectIdRegex, "Invalid module"),
      menuId: yup.string().typeError("Menu must be string").matches(objectIdRegex, "Invalid menu"),
      subMenuId: yup.string().typeError("Sub Menu must be string").matches(objectIdRegex, "Invalid sub menu"),

      enabled: yup.boolean().typeError("Status must be boolean").default(true),
      status: yup.boolean().typeError("Status must be boolean"),
      view: yup.boolean().typeError("View must be boolean"),
      create: yup.boolean().typeError("Create must be boolean"),
      edit: yup.boolean().typeError("Edit must be boolean"),
      remv: yup.boolean().typeError("Delete must be boolean"),
      subMenus: yup.array().of(
        yup.object().shape({
          id: yup
            .string()
            .typeError("Sub Menu must be string")
            .matches(objectIdRegex, "Invalid sub menu")
            .required("sub menu is required in bulk access"),
          view: yup.boolean().typeError("View must be boolean").required("View is required"),
          create: yup.boolean().typeError("Create must be boolean").required("Create is required"),
          edit: yup.boolean().typeError("Edit must be boolean").required("Edit is required"),
          remv: yup.boolean().typeError("Delete must be boolean").required("Delete is required"),
        })
      ),
      fullEnable: yup.bool().default(false),
    })
    .test("condition-validation", "Invalid fields for given type", (values) => {
      const { type, moduleId, menuId, subMenuId, status, view, create, edit, remv } = values;

      if (type === 1) {
        if (!moduleId) {
          return this.createError({
            message: "Module is required",
          });
        }

        if (!String(status)) {
          return this.createError({
            message: "Status is required",
          });
        }
      }

      if (type === 2) {
        if (!moduleId) {
          return this.createError({
            message: "Module is required",
          });
        }
        if (!menuId) {
          return this.createError({
            message: "Menu is required",
          });
        }
      }

      if (type === 3) {
        if (!menuId) {
          return this.createError({
            message: "Menu is required",
          });
        }
        if (!subMenuId) {
          return this.createError({
            message: "Sub menu is required",
          });
        }
      }

      return true;
    })
    .noUnknown();

  try {
    let obj = { ...body };

    if (obj.type) {
      obj.type = Number(obj.type);
    }

    let data = await schema.validate(obj, { abortEarly: false, stripUnknown: false });

    if (data.type === 1 || data.type === 4) {
      data.id = data.moduleId;
    }

    if (data.type === 2) {
      data.id = data.menuId;
    }

    if (data.type === 3) {
      data.id = data.subMenuId;
    }

    data.id = ObjectId(data?.id);

    return data;
  } catch (err) {
    let message = Array.isArray(err.errors) ? err.errors[0] : err.message;
    throw new Error(message, 400);
  }
};
