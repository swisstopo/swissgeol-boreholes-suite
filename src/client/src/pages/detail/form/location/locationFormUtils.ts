import {
  getPrecisionFromString,
  parseFloatWithThousandsSeparator,
} from "../../../../components/legacyComponents/formUtils.ts";
import { BoreholeSubmission, LocationFormInputs } from "./locationPanelInterfaces.tsx";

export const prepareLocationDataForSubmit = (formInputs: LocationFormInputs) => {
  const data = { ...formInputs } as BoreholeSubmission;
  if (data?.restrictionUntil) {
    if (!data.restrictionUntil.toString().endsWith("Z")) {
      data.restrictionUntil = data.restrictionUntil.toString() + "T00:00:00.000Z";
    }
  } else {
    data.restrictionUntil = null;
  }
  data.elevationZ = data?.elevationZ ? parseFloatWithThousandsSeparator(String(data.elevationZ)) : null;
  data.referenceElevation = data?.referenceElevation
    ? parseFloatWithThousandsSeparator(String(data.referenceElevation))
    : null;
  data.nationalInterest = data?.nationalInterest === 1 ? true : data?.nationalInterest === 0 ? false : null;
  data.restrictionId = data.restrictionId || null;
  data.referenceElevationTypeId = data.referenceElevationTypeId || null;
  data.elevationPrecisionId = data.elevationPrecisionId || null;
  data.locationPrecisionId = data.locationPrecisionId || null;
  data.qtReferenceElevationId = data.qtReferenceElevationId || null;
  data.alternateName = data?.alternateName || data.originalName;
  data.precisionLocationX = data?.locationX ? getPrecisionFromString(formInputs.locationX) : null;
  data.precisionLocationY = data?.locationY ? getPrecisionFromString(formInputs.locationY) : null;
  data.precisionLocationXLV03 = data?.locationXLV03 ? getPrecisionFromString(formInputs.locationXLV03) : null;
  data.precisionLocationYLV03 = data?.locationYLV03 ? getPrecisionFromString(formInputs.locationYLV03) : null;
  data.locationX = data?.locationX ? parseFloatWithThousandsSeparator(formInputs.locationX) : null;
  data.locationY = data?.locationY ? parseFloatWithThousandsSeparator(formInputs.locationY) : null;
  data.locationXLV03 = data?.locationXLV03 ? parseFloatWithThousandsSeparator(formInputs.locationXLV03) : null;
  data.locationYLV03 = data?.locationYLV03 ? parseFloatWithThousandsSeparator(formInputs.locationYLV03) : null;

  delete data.hrsId;
  return data;
};
