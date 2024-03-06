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
 * @param {string} numericString The string to parse.
 * @returns The parsed float number.
 */
export const parseFloatWithThousandsSeparator = (numericString: string) => parseFloat(numericString.replace(/'/g, ""));

/**
 * Get the maximum precision from two numeric strings.
 * @param {string} numericString1 The first string.
 * @param {string} numericString2 The second string.
 * @returns The maximum precision from the two strings.
 */
export const getMaxPrecision = (numericString1: string, numericString2: string) =>
  Math.max(getPrecisionFromString(numericString1), getPrecisionFromString(numericString2));

/**
 * Get the precision from a string.
 * @param {string} numericString The string to get the precision from.
 * @returns The precision of the string.
 */
export const getPrecisionFromString = (numericString: string) => numericString.split(".")[1]?.length || 0;
