/**
 * Clamp a number to the range defined by min and max.
 * If min > max, max is returned.
 *
 * @param {Number} num The number to clamp
 * @param {Number} min The lower boundary
 * @param {Number} max The upper boundary
 * @returns A number between min and max
 */
export const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
