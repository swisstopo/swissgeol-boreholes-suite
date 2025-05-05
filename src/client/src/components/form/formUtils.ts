import { theme } from "../../AppTheme.ts";

/**
 * Parse the input value if it's a string. If it's a number, return it as is.
 * @param {string | number} value The value to parse.
 * @returns The parsed float number if the input is a string, or the input value itself if it's a number.
 */
export const parseIfString = (value: string | number) => {
  if (typeof value === "string") {
    return parseFloatWithThousandsSeparator(value);
  } else {
    return value;
  }
};

/**
 * Parse a string to a float number, removing thousands separators if present.
 * @param {string/ number} value The string or number to parse.
 * @returns The parsed float number.
 */
export const parseFloatWithThousandsSeparator = (value?: string | number | null) => {
  if (typeof value === "number") return value;
  if (value === "0") return 0;
  if (!value) return null;
  const numericString = value.toString();
  return parseFloat(numericString.replace(/'/g, ""));
};

/**
 * Get the precision from a numeric string. Works only for strings with a decimal point, not with scientific notation.
 * @param {string} numericString The string to get the precision from.
 * @returns The precision of the string.
 */
export const getDecimalsFromNumericString = (numericString: string) => numericString.split(".")[1]?.length || 0;

/**
 * Gets the style definition for the MUI Textfield's border color based on whether the field is readonly.
 * @param {boolean} isReadOnly The boolean defining whether the field is readonly.
 * @returns The style definition.
 */
export const getFieldBorderColor = (isReadOnly: boolean) => {
  return {
    "& .MuiOutlinedInput-notchedOutline": {
      borderColor: isReadOnly ? theme.palette.border.light : theme.palette.border.darker,
    },
  };
};

/**
 * Formats a number with scientific notation.
 * @param {number} value The number to format.
 * @returns The formatted number.
 */
const formatWithScientificNotation = (value: number) => {
  const fullExponential = value.toExponential();
  const exponentialFractionDigits = getDecimalsFromNumericString(fullExponential.split("e")[0]);
  return value.toExponential(Math.min(exponentialFractionDigits, 3)).replace("e", " x 10");
};

/**
 * Formats a number with thousands separators.
 * @param {number} minDecimals The minimum number of decimal places to display.
 * @param {number} value The number to format.
 * @returns The formatted number.
 */
const formatWithThousandsSeparator = (minDecimals: number, value: number) => {
  // Format number using de-CH
  const formatted = new Intl.NumberFormat("de-CH", {
    useGrouping: true,
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: Math.max(3, minDecimals),
  }).format(value);
  // Ensure thousand separators are always a standard single quote (')
  return formatted.replace(/’/g, "'");
};

/**
 * Formats a number with thousands separators and a minimum number of decimal places.
 * If the number is less than 0.001 and has more than 3 decimal places, the number is formatted with scientific notation.
 * @param {number} value The number to format.
 * @param {number} minDecimals The minimum number of decimal places to display (defaults to 0).
 * @returns The formatted number.
 */
export const formatNumberForDisplay = (value: number | null, minDecimals = 0): string => {
  if (value == null) return "-";
  if (Math.abs(value) < 0.001 && value !== 0) {
    return formatWithScientificNotation(value);
  }
  return formatWithThousandsSeparator(minDecimals, value);
};

export const ensureDatetime = (date: string) => (date.endsWith("Z") ? date : `${date}T00:00:00.000Z`);
