export const parseIfString = (value: string | number) => {
  if (typeof value === "string") {
    return parseFloatWithTousandsSeparator(value);
  } else {
    return value;
  }
};

export const parseFloatWithTousandsSeparator = (value: string) => parseFloat(value.replace(/'/g, ""));

export const getMaxPrecision = (x: string, y: string) => Math.max(getPrecisionFromString(x), getPrecisionFromString(y));

export const getPrecisionFromString = (x: string) => x.split(".")[1]?.length || 0;
