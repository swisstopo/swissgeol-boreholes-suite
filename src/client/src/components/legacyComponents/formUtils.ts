import { Identifier } from "../../api/borehole.ts";
import { BoreholeFormInputs } from "../../pages/detail/form/borehole/boreholePanelInterfaces.ts";
import {
  LocationFormInputs,
  LocationFormSubmission,
} from "../../pages/detail/form/location/locationPanelInterfaces.tsx";

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

/**
 * Transforms the location form data into a format that can be submitted to the API.
 * @param {LocationFormInputs} formInputs The data from the location form.
 * @returns The location data in a format that can be submitted to the API.
 */
export const prepareLocationDataForSubmit = (formInputs: LocationFormInputs) => {
  const data = { ...formInputs } as LocationFormSubmission;

  const ensureDatetime = (date: string) => (date.endsWith("Z") ? date : `${date}T00:00:00.000Z`);
  const parseValueIfNotNull = (value: string | number | null) =>
    value ? parseFloatWithThousandsSeparator(String(value)) : null;

  const getCompleteCodelists = (codelists: Identifier[]) => {
    return codelists
      .map(c => {
        delete c.borehole;
        delete c.codelist;
        return c;
      })
      .filter(c => c.codelistId && c.value && c.boreholeId);
  };

  data.restrictionUntil = data?.restrictionUntil ? ensureDatetime(data.restrictionUntil.toString()) : null;
  data.elevationZ = parseValueIfNotNull(data?.elevationZ);
  data.referenceElevation = parseValueIfNotNull(data?.referenceElevation);
  data.nationalInterest = data?.nationalInterest === 1 ? true : data?.nationalInterest === 0 ? false : null;
  data.restrictionId = data.restrictionId ?? null;
  data.referenceElevationTypeId = data.referenceElevationTypeId ?? null;
  data.elevationPrecisionId = data.elevationPrecisionId ?? null;
  data.locationPrecisionId = data.locationPrecisionId ?? null;
  data.referenceElevationPrecisionId = data.referenceElevationPrecisionId ?? null;
  data.name = data?.name ?? data.originalName;
  data.precisionLocationX = data?.locationX ? getPrecisionFromString(formInputs.locationX) : null;
  data.precisionLocationY = data?.locationY ? getPrecisionFromString(formInputs.locationY) : null;
  data.precisionLocationXLV03 = data?.locationXLV03 ? getPrecisionFromString(formInputs.locationXLV03) : null;
  data.precisionLocationYLV03 = data?.locationYLV03 ? getPrecisionFromString(formInputs.locationYLV03) : null;
  data.locationX = parseValueIfNotNull(data?.locationX);
  data.locationY = parseValueIfNotNull(data?.locationY);
  data.locationXLV03 = parseValueIfNotNull(data?.locationXLV03);
  data.locationYLV03 = parseValueIfNotNull(data?.locationYLV03);
  data.boreholeCodelists = getCompleteCodelists(data.boreholeCodelists);
  return data;
};

/**
 * Transforms the borehole form data into a format that can be submitted to the API.
 * @param {BoreholeFormInputs} formInputs The data from the borehole form.
 * @returns The borehole data in a format that can be submitted to the API.
 */
export const prepareBoreholeDataForSubmit = (formInputs: BoreholeFormInputs) => {
  const data = { ...formInputs };
  const parseValueIfNotNull = (value: string | number | null) =>
    value ? parseFloatWithThousandsSeparator(String(value)) : null;
  data.totalDepth = parseValueIfNotNull(data?.totalDepth);
  data.topBedrockFreshMd = parseValueIfNotNull(data?.topBedrockFreshMd);
  data.topBedrockWeatheredMd = parseValueIfNotNull(data?.topBedrockWeatheredMd);
  data.hasGroundwater = data?.hasGroundwater === 1 ? true : data?.hasGroundwater === 0 ? false : null;

  return data;
};
