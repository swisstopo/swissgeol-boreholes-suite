import { Identifier } from "../../../../api/borehole.ts";
import {
  getPrecisionFromString,
  parseFloatWithThousandsSeparator,
} from "../../../../components/legacyComponents/formUtils.ts";
import { BoreholeSubmission, LocationFormInputs } from "./locationPanelInterfaces.tsx";

export const prepareLocationDataForSubmit = (formInputs: LocationFormInputs) => {
  const data = { ...formInputs } as BoreholeSubmission;

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
  data.qtReferenceElevationId = data.qtReferenceElevationId ?? null;
  data.alternateName = data?.alternateName ?? data.originalName;
  data.precisionLocationX = data?.locationX ? getPrecisionFromString(formInputs.locationX) : null;
  data.precisionLocationY = data?.locationY ? getPrecisionFromString(formInputs.locationY) : null;
  data.precisionLocationXLV03 = data?.locationXLV03 ? getPrecisionFromString(formInputs.locationXLV03) : null;
  data.precisionLocationYLV03 = data?.locationYLV03 ? getPrecisionFromString(formInputs.locationYLV03) : null;
  data.locationX = parseValueIfNotNull(data?.locationX);
  data.locationY = parseValueIfNotNull(data?.locationY);
  data.locationXLV03 = parseValueIfNotNull(data?.locationXLV03);
  data.locationYLV03 = parseValueIfNotNull(data?.locationYLV03);
  data.boreholeCodelists = getCompleteCodelists(data.boreholeCodelists);

  delete data.hrsId;
  delete data.codelists;
  return data;
};
