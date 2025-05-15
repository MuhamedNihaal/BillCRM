export const objectIdRegex = /^[0-9a-fA-F]{24}$/;
export const nameStartWithLetterRegex = /^[A-Za-z].*$/;
export const dynamicRequire = (schema, required, message) =>
  required ? schema.required(message) : schema;
export const mobileWithLandPhone =
  /^(\+?\d{1,3}[- ]?)?(\d{2,4}[- ]?)?(\d{7,11})$/;
export const mobileOnly = /^(\+?\d{1,3}[- ]?)?[6-9]\d{9}$/;
export const dobRex = /^\d{4}-\d{2}-\d{2}$/;
export const dateRex = /^\d{4}-\d{2}-\d{2}$/;
export const timeRex = /^([01]\d|2[0-3]):([0-5]\d)$/;
