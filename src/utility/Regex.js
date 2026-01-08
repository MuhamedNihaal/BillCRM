import { isValidPhoneNumber } from "react-phone-number-input";

export const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
export const ObjectIdRegex = /^[0-9a-fA-F]{24}$/;
export const durationRegex = /^\d{2}:\d{2}$/;
export const mobileWithLandPhone =
  /^((\+*)((0[ -]*)*|((91 )*))((\d{12})+|(\d{10})+))|\d{5}([- ]*)\d{6}$/;
export const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
export const yupMobileValidation = (schema) =>
  schema.test("is-valid-phone", "Invalid mobile number", (value) =>
    value ? isValidPhoneNumber(value) : false,
  );

export const emojiRegex = /[\p{Emoji}\uFE0F]/u;


export const longitudeRegex = /^[-+]?((180(\.0+)?)|(1[0-7]\d(\.\d+)?)|(\d{1,2}(\.\d+)?))$/