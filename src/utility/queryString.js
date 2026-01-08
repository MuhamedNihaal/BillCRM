/**
 *
 * @param {object|Array<string|number>} queries - Either an object of key-value pairs or an array of values.
 * @param {string} [key] - When `queries` is an array, this key will be used for all array values.
 * @returns {string} A URL-encoded query string.
 *
 * @example
 * // Using array + key
 * queryString(["js", "node", "react"], "tags");
 * // 👉 "tags=js&tags=node&tags=react"
 *
 * @example
 * // Using object
 * queryString({ tags: ["js", "node"], page: 2 });
 * // 👉 "tags=js&tags=node&page=2"
 */
export const queryString = (queries, key) => {
  const query = new URLSearchParams();

  if (Array.isArray(queries) && key) {
    queries.forEach((item) => query.append(key, item));
  } else if (typeof queries === "object" && queries !== null) {
    Object.entries(queries).forEach(([k, value]) => {
      if (Array.isArray(value)) {
        value.forEach((item) => query.append(k, item));
      } else if (value !== undefined && value !== null) {
        query.append(k, value);
      }
    });
  }

  return query.toString();
};
