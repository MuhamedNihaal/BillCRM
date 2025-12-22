import moment from "moment";

/**
 * Get a single formatted date/time string using Moment.js.
 *
 * @param {"date" | "time" | "timeWithSecond" | "dateAndTime" | "dateAndTimeWithSecond"} type
 * The format you want returned.
 *
 * @param {string|number|Date|moment.Moment} [inputDate]
 * Optional. Any value Moment can parse. Defaults to current time.
 *
 * @returns {string} A formatted date/time string.
 *
 * @throws {Error} If the format type is invalid.
 */

function getTimeParam(type, inputDate) {
  const now = inputDate ? moment(inputDate) : moment();

  switch (type) {
    case "date":
      return now.format("YYYY-MM-DD");

    case "time":
      return now.format("HH:mm");
    case "timeWithSecond":
      return now.format("HH:mm:ss");

    case "dateAndTime":
      return now.format("YYYY-MM-DD HH:mm");

    case "dateAndTimeWithSecond":
      return now.format("YYYY-MM-DD HH:mm:ss");

    default:
      throw new Error(`Invalid time format type: ${type}`);
  }
}

export { getTimeParam };
export default getTimeParam;
