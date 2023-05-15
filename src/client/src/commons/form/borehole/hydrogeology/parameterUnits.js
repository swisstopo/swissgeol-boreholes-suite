/**
 * `ParameterUnits` is an object that maps GeolCodes of the Hydrotest.parameter codelist "htestres101" to their corresponding units of measurement.
 *
 * Each property in the `ParameterUnits` object represents a GeolCode as a key and its corresponding
 * unit of measurement as a value. This mapping is used to determine the unit of measurement for
 * a particular parameter based on its GeolCode.
 *
 * Key-value pairs in `ParameterUnits`:
 * - `1`, `2`: "m/s" (meters per second)
 * - `3`: "m2/s" (square meters per second)
 * - `4`, `9`: "" (no unit)
 * - `5`: "Pa" (Pascals)
 * - `6`: "1/m" (inverse meters)
 * - `7`: "Lu" (Lambertian reflectance units)
 * - `8`: "m" (meters)
 */

export const ParameterUnits = {
  1: "m/s",
  2: "m/s",
  3: "m2/s",
  4: "",
  5: "Pa",
  6: "1/m",
  7: "Lu",
  8: "m",
  9: "",
};
