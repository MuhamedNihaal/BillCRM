import moment from "moment";
import NumberToWords from "number-to-words";
import _ from "lodash";

/**
 *
 * @param {number|string} amount The amount to be formatted.
 * @param {boolean} symbol If true, formats as currency with the Indian Rupee symbol.
 * @param {"normal"|"amount"|"formatAmount"} mode The formatting mode. "normal" returns an object with both values. "amount" returns only the numeric value. "formatAmount" returns only the formatted string.
 * @returns {number|string|{amount: number, formatAmount: string}} The formatted amount based on the selected mode.
 */
export const amountFormatter = (amount, symbol, mode = "normal") => {
  let output = symbol
    ? {
        style: "currency",
        currency: "INR",
      }
    : {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      };
  amount =
    typeof amount === "string"
      ? Number(amount?.replace(/[^0-9.]/g, ""))
      : typeof amount === "number"
        ? amount
        : 0;

  let formatAmount = new Intl.NumberFormat("en-IN", output).format(amount);

  if (mode === "amount") return amount;
  if (mode === "formatAmount") return formatAmount;

  return { amount, formatAmount };
};

export const numberFormatter = (number) => {
  if (number === null || number === undefined) return "-";

  const absValue = Math.abs(Number(number));
  let formatted = number;

  if (absValue >= 1_000_000_000) {
    formatted = (number / 1_000_000_000).toFixed(1).replace(/\.0$/, "") + "B";
  } else if (absValue >= 1_000_000) {
    formatted = (number / 1_000_000).toFixed(1).replace(/\.0$/, "") + "M";
  } else if (absValue >= 1_000) {
    formatted = (number / 1_000).toFixed(1).replace(/\.0$/, "") + "K";
  }

  return formatted;
};

//================> Date
export const dateFormatter = (date) => {
  const formats = [moment.ISO_8601, "YYYY-MM-DD HH:mm:ss"];
  const isValidDate = moment(date, formats, true).isValid();
  return isValidDate ? moment(date).format("DD-MM-YYYY") : "";
};

export const timeFormatter = (time) => {
  const formats = ["HH:mm:ss", "HH:mm", "YYYY-MM-DD HH:mm:ss"];
  const isValidTime = moment(time, formats, true).isValid();
  return isValidTime ? moment(time, formats).format("hh:mm a") : "";
};

export const durationFormatter = (totalMinutes) => {
  if (
    totalMinutes === undefined ||
    totalMinutes === null ||
    isNaN(totalMinutes) ||
    totalMinutes == 0
  )
    return "00:00:00";
  if (totalMinutes >= 60) {
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    if (minutes === 0) {
      return hours === 1 ? `${hours} Hour` : `${hours} Hours`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  } else {
    return totalMinutes === 1
      ? `${totalMinutes} Minute`
      : `${totalMinutes} Minutes`;
  }
};

export const numberToWords = (val) => {
  let number = Number(val);
  if (isNaN(number)) number = 0;

  number = _.startCase(_.toLower(NumberToWords.toWords(number)));

  return number;
};
