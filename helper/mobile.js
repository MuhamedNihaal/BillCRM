import { parsePhoneNumberFromString } from "libphonenumber-js";

/**
 * @param {string} mobile - Mobile number in international or local format (e.g., "+919876543210" or "09876543210").
 * @returns {{ country: string, callingCode: string }} Object containing the country code (e.g., "IN") and calling code (e.g., "+91").
 * @throws {Error} If the mobile number is missing or invalid.
 */
export const getCountryCode = (mobile) => {
  if (!mobile) throw new Error("Mobile number is required");

  let formatted = mobile.trim();

  if (!formatted.startsWith("+")) {
    formatted = "+" + formatted;
  }

  const phoneNumber = parsePhoneNumberFromString(formatted);

  if (!phoneNumber) throw new Error("Invalid phone number. Please include the country code (e.g., 91).");

  return {
    country: phoneNumber.country,
    callingCode: `+${phoneNumber.countryCallingCode}`,
  };
};

/**
 *
 * @param {string|number} mobile - The input mobile number (can include + or be plain digits).
 * @returns {{ international: string, national: string, country: string|null, callingCode: string|null, isValid: boolean }}
 *
 * @example
 * parsePhoneNumber('7211480014');
 * // { international: '+917211480014', national: '917211480014', country: 'IN', isValid: true }
 *
 * @example
 * parsePhoneNumber('+447911123456');
 * // { international: '+447911123456', national: '447911123456', country: 'GB', isValid: true }
 */

export const parsePhoneNumber = (mobile) => {
  if (!mobile) throw new Error("Mobile number is required");

  let input = String(mobile).trim();

  const parsed = parsePhoneNumberFromString(input);

  if (parsed && parsed.isValid()) {
    return {
      international: parsed.number,
      national: parsed.number.replace("+", ""),
      country: parsed.country,
      callingCode: parsed.countryCallingCode,
      isValid: true,
    };
  }

  input = input.replace("+", "");

  const fallback = parsePhoneNumberFromString(input, "IN");
  if (fallback && fallback.isValid()) {
    return {
      international: fallback.number,
      national: fallback.number.replace("+", ""),
      country: fallback.country,
      callingCode: fallback.countryCallingCode,
      isValid: true,
    };
  }

  input = input.startsWith("+") ? input : `+${input}`;
  const fallback2 = parsePhoneNumberFromString(input);
  if (fallback2 && fallback2.isValid()) {
    return {
      international: fallback2.number,
      national: fallback2.number.replace("+", ""),
      country: fallback2.country,
      callingCode: fallback2.countryCallingCode,
      isValid: true,
    };
  }

  return {
    international: input.startsWith("+") ? input : `+${input}`,
    national: input.replace("+", ""),
    country: null,
    callingCode: null,
    isValid: false,
  };
};

export const removePlus = (text = "") => text?.replace(/^\+/, "");
