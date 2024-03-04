export const extractCasingDepth = casing => {
  var min = null;
  var max = null;
  if (casing?.casingElements != null) {
    casing.casingElements.forEach(element => {
      if (element?.fromDepth != null && (min === null || element.fromDepth < min)) {
        min = element.fromDepth;
      }
      if (element?.toDepth != null && (max === null || element.toDepth > max)) {
        max = element.toDepth;
      }
    });
  }
  return { min, max };
};
