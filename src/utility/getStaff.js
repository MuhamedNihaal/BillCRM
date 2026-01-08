/**
 *
 * @param {Object|string} doc - Either:
 *   - A string (firstName), optionally paired with `key` as lastName.
 *   - An object containing `updatedBy`/`addedBy` fields with name data.
 * @param {string} [key="staff"] - The object key for returned staff mapping.
 *   - When `doc` is a string, this acts as the lastName.
 *   - When `doc` is an object, this is the key in the returned object.
 * @param {string|null} [fallback=null] - Value returned if no name can be determined.
 * @returns {string|Object} A formatted full name (string) if `doc` is a string,
 *   otherwise an object of shape `{ [key]: string|null }`.
 *
 * @example
 * // Direct first/last name
 * getStaff("John", "Doe"); // "John Doe"
 *
 * @example
 * // From document object
 * getStaff({ updatedBy: { firstName: "Jane", lastName: "Smith" } }, "author");
 * // { author: "Jane Smith" }
 *
 * @example
 * // With fallback
 * getStaff({}, "staff", "Unknown"); // { staff: "Unknown" }
 */
export const getStaff = (doc = null, key = "staff", fallback = {}) => {
  if (!doc) return null;

  const formatName = (person) => {
    if (!person) return null;

    const first = person.firstName?.trim();
    const last = person.lastName?.trim();
    const full = person.name?.trim();

    if (full) return full;
    if (first && last) return `${first} ${last}`;
    return first || last || null;
  };

  if (typeof doc === "string") {
    return formatName({ firstName: doc, lastName: "" }) || fallback;
  }

  const name =
    formatName(fallback) ||
    formatName(doc?.updatedBy) ||
    formatName(doc?.addedBy) ||
    null;

  return { [key]: name };
};
