export const objectIdRegex = /^[0-9a-fA-F]{24}$/;
export const nameStartWithLetterRegex = /^[A-Za-z].*$/;
export const dynamicRequire = (schema, required, message) => (required ? schema.required(message) : schema);
export const mobileWithLandPhone = /^((\+*)((0[ -]*)*|((91 )*))((\d{12})+|(\d{10})+))|\d{5}([- ]*)\d{6}$/;
export const mobileOnly = /^(\+?\d{1,3}[- ]?)?[6-9]\d{9}$/;
export const dobRex = /^\d{4}-\d{2}-\d{2}$/;
export const dateRex = /^\d{4}-\d{2}-\d{2}$/;
export const timeRex = /^([01]\d|2[0-3]):([0-5]\d)$/;

export const dateRexYup = (schema, fieldName = "Date") => {
  return schema.matches(dateRex, `${fieldName} must be in YYYY-MM-DD format`);
};

export const timeRexYup = (schema, fieldName = "Time") => {
  return schema.matches(timeRex, `${fieldName} must be in HH:mm format`);
};

export const checkObjectIdValid = (id) => {
  const objectIdRegex = /^[0-9a-fA-F]{24}$/;
  return objectIdRegex.test(id);
};

export const caseInsensitiveExact = (name) => {
  name = String(name)
    ?.trim()
    ?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

  return { $regex: new RegExp(`^${name}$`, "i") };
};

export const validateSpaceAndLetters = (name = null, field = "Name", allowAll = false, schema = /^[A-Za-z].*$/) => {
  try {
    if (isNull(name)) throw new Error(`${field} field is required`, 400);

    const formattedName = String(name)?.trim();

    if (!allowAll && !schema.test(formattedName)) {
      throw new Error(`${field} must start with a letter and contain at least one letter`, 400);
    }

    return formattedName;
  } catch (e) {
    throw new Error(e?.message, 400);
  }
};;

export const urlRegex =
  /^(https?:\/\/)([a-zA-Z0-9-._~%]+@)?([a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}(:\d+)?(\/[a-zA-Z0-9-._~%!$&'()*+,;=:@/]*)?(\?[a-zA-Z0-9-._~%!$&'()*+,;=:@/?]*)?(#[a-zA-Z0-9-._~%!$&'()*+,;=:@/?]*)?$/;
