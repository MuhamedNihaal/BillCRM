import * as yup from "yup";

export const amountCellSchema = yup
  .mixed()
  .test(
    "is-valid-amount-data",
    "Expected a string or an object with { amount, profit, currency }",
    (value) => {
      if (["string", "number"].includes(typeof value)) return true;

      if (typeof value === "object" && value !== null) {
        const schema = yup.object({
          amount: yup.number().required(),
          profit: yup.number().optional(),
          currency: yup.string().optional(),
        });
        return schema.isValidSync(value);
      }

      return false;
    },
  );

export const dropdownCellSchema = yup
  .mixed()
  .test(
    "is-valid-collaborator-data",
    "Expected a object {value, options]",
    (value) => {
      if (typeof value !== "object" || value === null) return false;

      const schema = yup.object({
        value: yup
          .mixed()
          .test("is-valid-value", "Value is required", (val) => {
            if (String(val)) return true;
            if (
              typeof val === "object" &&
              val &&
              String(val.label) &&
              String(val.value)
            ) {
              return true;
            }
            return false;
          }),
        options: yup
          .array()
          .of(
            yup.object({
              label: yup.string().required(),
              value: yup.string().required(),
            }),
          )
          .notRequired(),
      });

      return schema.isValidSync(value);
    },
  );

export const badgeCellSchema = yup
  .mixed()
  .test(
    "is-valid-badge-data",
    "Expected a string or an object with { label, color }",
    (value) => {
      if (typeof value === "string") return true;

      if (typeof value === "object" && value !== null) {
        const objSchema = yup.object({
          label: yup.string().required(),
          color: yup.string().optional(),
        });
        return objSchema.isValidSync(value);
      }

      return false;
    },
  );

export const bundleCellSchema = yup
  .mixed()
  .test(
    "is-valid-bundle-data",
    "Expected an object with { img, title, time, count : { label, value }  }",
    (value) => {
      if (typeof value !== "object" || value === null) return false;

      const countSchema = yup.object({
        label: yup.string().required(),
        value: yup.mixed().required(),
      });

      const schema = yup.object({
        img: yup.string().optional().nullable(),
        title: yup.string().required(),
        time: yup.string().optional().nullable(),
        count: countSchema.required(),
      });

      return schema.isValidSync(value);
    },
  );

export const collaboratorCellSchema = yup
  .mixed()
  .test(
    "is-valid-collaborator-data",
    "Expected an array of objects [{ img, name }]",
    (value) => {
      if (!Array.isArray(value) || value === null) return false;

      const schema = yup.array().of(
        yup.object({
          img: yup.string().optional(),
          name: yup.string().required(),
        }),
      );

      return schema.isValidSync(value);
    },
  );
