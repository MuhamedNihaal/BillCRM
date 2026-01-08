/**
 * @param {Object} params
 * @param {Array<string|{field: string, path?: string, default?: any}>} params.fields
 *   List of field definitions.
 * @param {Object} [params.data={}]
 *   Source data object to read values from.
 * @param {(field: string, value: any) => void} [params.setValue=() => {}]
 *   Callback used to assign values (e.g. from react-hook-form).
 * @param {boolean} [params.removeNullValue=false]
 *   If true, null/undefined values will be skipped instead of set.
 *
 * @example
 * const fields = [
 *   { field: "state", path: "state.value", default: "Karnataka" },
 *   { field: "country", path: "country.value", default: "India" },
 *   "city"
 * ];
 *
 * const data = {
 *   state: { value: "Tamil Nadu" },
 *   country: { value: "IN" },
 *   city: "Chennai"
 * };
 *
 * valueSetter({ fields, data, setValue: (field, val) => console.log(field, val) });
 * // Logs:
 * // state Tamil Nadu
 * // country IN
 * // city Chennai
 */
export const valueSetter = ({
  fields = [],
  data = {},
  setValue = () => {},
  removeNullValue = false,
}) => {
  fields.forEach((options) => {
    let field = null;
    let value = null;
    let path = null;

    if (typeof options === "object") {
      field = options.field;
      value = options.default ?? "";
      path = options.path ?? null;
    } else {
      field = options;
      value = "";
    }

    if (path) {
      const nestedValue = path
        .split(".")
        .reduce((acc, key) => acc?.[key], data);

      if (nestedValue !== undefined && nestedValue !== null) {
        value = nestedValue;
      } else if (
        field in data &&
        data[field] !== undefined &&
        data[field] !== null
      ) {
        value = data?.[field]?.[path];
      }
    } else if (field in data) {
      const directValue = data[field];
      if (directValue !== undefined && directValue !== null) {
        value = directValue;
      }
    }

    if (
      removeNullValue &&
      (value === null || value === undefined || value === "")
    ) {
      return;
    }

    setValue(field, value);
  });
};
