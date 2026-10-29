type Depths<Key extends string> = { [K in Key]?: number | null };

// Sorts two objects based on their depth. The toDepthKey is only used if the values for the fromDepthKey are equal.
// Returns a negative number if `a` should be sorted before `b`, a positive number if `a` should be sorted after `b`,
// or 0 if they have the same depth.
export const sortByDepth = <FromDepthKey extends string, ToDepthKey extends string>(
  a: Depths<FromDepthKey | ToDepthKey>,
  b: Depths<FromDepthKey | ToDepthKey>,
  fromDepthKey: FromDepthKey,
  toDepthKey: ToDepthKey,
): number => {
  // Number() keeps the JavaScript coercion: null counts as 0, undefined makes the result NaN.
  const minDiff = Number(a[fromDepthKey]) - Number(b[fromDepthKey]);
  if (minDiff !== 0) {
    return minDiff;
  } else {
    return Number(a[toDepthKey]) - Number(b[toDepthKey]);
  }
};
