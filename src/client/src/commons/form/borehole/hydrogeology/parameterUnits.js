/**
 * `TestResultParameterUnits` is an object that maps GeolCodes of the Hydrotest.parameter codelist "htestres101" to their corresponding units of measurement.
 *
 * Each property in the `TestResultParameterUnits` object represents a GeolCode as a key and its corresponding
 * unit of measurement as a value. This mapping is used to determine the unit of measurement for
 * a particular parameter based on its GeolCode.
 *
 * The units are defined in jsx to allow correctly displaying the exponent.
 *
 * Key-value pairs in `TestResultParameterUnits`:
 * - `1`, `2`: "m/s" (meters per second)
 * - `3`: "m2/s" (square meters per second)
 * - `4`, `9`: "" (no unit)
 * - `5`: "Pa" (Pascals)
 * - `6`: "1/m" (inverse meters)
 * - `7`: "Lu" (Lambertian reflectance units)
 * - `8`: "m" (meters)
 */

export const TestResultParameterUnits = {
  1: <>m/s</>,
  2: <>m/s</>,
  3: (
    <>
      m<sup>2</sup>/s
    </>
  ),
  4: <></>,
  5: <>Pa</>,
  6: <>1/m</>,
  7: <>Lu</>,
  8: <>m</>,
  9: <></>,
};

/**
 * `FieldMeasurementParameterUnits` is an object that maps GeolCodes of the FieldMeasurement.parameter codelist "field102" to their corresponding units of measurement.
 *
 * Each property in the `FieldMeasurementParameterUnits` object represents a GeolCode as a key and its corresponding
 * unit of measurement as a value. This mapping is used to determine the unit of measurement for
 * a particular parameter based on its GeolCode.
 *
 * Key-value pairs in `FieldMeasurementParameterUnits`:
 * - `1`: "°C" (degrees Celsius)
 * - `2`: "" (no unit)
 * - `3`,4`: "µS/cm" (microsiemens per centimeter)
 * - `5`: "mV" (millivolts)
 * - `6`: "%" (percent)
 * - `7`: "mg/L" (milligrams per liter)
 */

export const FieldMeasurementParameterUnits = {
  1: "°C",
  2: "-",
  3: "µS/cm",
  4: "µS/cm",
  5: "mV",
  6: "%",
  7: "mg/L",
};
