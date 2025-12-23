export const paginationValues = ({ page, limit, sortBy, sortByIn }) => {
  if (isNull(page) || page < 1) page = 1;
  else page = Number(page);

  if (isNull(limit) || limit < 1) limit = 20;
  else limit = Number(limit);

  const skip = (page - 1) * limit;

  let sortByFields = { _id: -1, createdAt: -1 };

  if (sortByIn === "asc") {
    sortByIn = 1;
  }
  if (sortByIn === "desc") {
    sortByIn = -1;
  }

  if (!isNull(sortBy && sortByIn)) sortByFields = { [sortBy]: sortByIn };

  return { page, limit, skip, sortBy: sortByFields };
};

export const querySearchSanitize = (search) => {
  return String(search)
    ?.trim()
    ?.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

/**
 * Safely extracts a query parameter that may come as:
 * - single value (string)
 * - array value
 * - polluted value (req.queryPolluted)
 * Optionally maps each value using a transformer function.
 *
 * @param {Object} req - Express request object
 * @param {string} key - Query parameter key
 * @param {Function} [transformer] - Optional function to transform each value
 * @returns {Array} - Cleaned array of values (possibly transformed)
 */
export const getQueryArray = (req, key, transformer = null) => {
  const polluted = req.queryPolluted?.[key];
  const normal = req.query?.[key];

  const values = Array.isArray(polluted) ? polluted : polluted ? [polluted] : Array.isArray(normal) ? normal : normal ? [normal] : [];

  let final_value = values.filter(Boolean);

  return transformer ? final_value.map(transformer ? transformer : (v) => v) : final_value;
};
