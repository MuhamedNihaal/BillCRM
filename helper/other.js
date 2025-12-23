/**
 * Compares two values by converting them to strings.
 * Useful for comparing MongoDB ObjectIds, numbers, or mixed types.
 * @function isSame
 * @param {*} first - The first value to compare. Can be an ObjectId, string, number, or any value.
 * @param {*} second - The second value to compare.
 * @returns {boolean} Returns `true` if both values represent the same string value; otherwise `false`.
 *
 * @example
 * isSame("123", 123);
 *
 * @example
 * import mongoose from "mongoose";
 * isSame(new mongoose.Types.ObjectId("abc"), "abc"); // true
 *
 * @example
 * isSame(null, undefined); // false
 */
export const isSame = (first, second) => {
  if (first == null || second == null) return false;
  return String(first) === String(second);
};

export const isObjectIdsEqual = isSame;

export const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export function deepCleanNulls(obj) {
  if (Array.isArray(obj)) {
    const cleanedArray = obj.map(deepCleanNulls);

    return cleanedArray.filter((item) => {
      if (item == null) {
        return false;
      }

      if (typeof item === "object" && !Array.isArray(item) && Object.keys(item).length === 0) {
        return false;
      }

      if (Array.isArray(item) && item.length === 0) {
        return false;
      }
      return true;
    });
  } else if (typeof obj === "object" && obj !== null) {
    const entries = Object.entries(obj)
      .filter(([_, value]) => value != null)
      .map(([key, value]) => [key, deepCleanNulls(value)]);

    const filteredEntries = entries.filter(([_, value]) => {
      if (typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === 0) {
        return false;
      }

      if (Array.isArray(value) && value.length === 0) {
        return false;
      }
      return true;
    });

    return Object.fromEntries(filteredEntries);
  }

  return obj;
}

export const callWithAsyncErrorHandler = (fn, req) => {
  return new Promise((resolve, reject) => {
    const res = {
      json: (data) => resolve(data),
      send: (data) => resolve(data),
      status: function () {
        return this;
      },
    };

    const next = (err) => reject(err);

    fn(req, res, next);
  });
};

export function safelyParseJSON(val) {
  try {
    return JSON.parse(val);
  } catch {
    return val;
  }
}
