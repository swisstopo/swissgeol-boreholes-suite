export const parseIfString = value => {
  if (typeof value === "string") {
    return parseFloat(value.replace(/'/g, ""));
  } else {
    return value;
  }
};

export const getPrecision = (x, y) => {
  const precision_x = x.toString().split(".")[1]?.length || 0;
  const precision_y = y.toString().split(".")[1]?.length || 0;
  return Math.max(precision_x, precision_y);
};
