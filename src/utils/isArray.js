/**
 * Return the whole array (if valid) or,
 * if an index is provided, the element at that index.
 * @param {Array} arr
 * @param {number} [index]  Optional position to pick
 * @returns {Array|any}
 */
export function isArray(arr, index = undefined) {
  if (!Array.isArray(arr)) return index ? undefined : [];
  if (index === undefined) return arr;
  return arr[index];
}
