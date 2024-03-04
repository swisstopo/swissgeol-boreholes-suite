/**
 * Sorts two objects based on their depth.
 * @param {Object} a - The first object to compare.
 * @param {Object} b - The second object to compare.
 * @param {string} fromDepthKey - The first key to compare the objects by.
 * @param {string} toDepthKey - The second key to compare the objects by. Is only used if the values for the first key are equal.
 * @returns {number} - A negative number if `a` should be sorted before `b`, a positive number if `a` should be sorted after `b`, or 0 if they have the same depth.
 */
export const sortByDepth = (a, b, fromDepthKey, toDepthKey) => {
  var minDiff = a[fromDepthKey] - b[fromDepthKey];
  if (minDiff !== 0) {
    return minDiff;
  } else {
    return a[toDepthKey] - b[toDepthKey];
  }
};
