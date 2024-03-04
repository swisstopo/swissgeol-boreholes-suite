export const sortByDepth = (a, b, fromKey, toKey) => {
  var minDiff = a[fromKey] - b[fromKey];
  if (minDiff !== 0) {
    return minDiff;
  } else {
    return a[toKey] - b[toKey];
  }
};
