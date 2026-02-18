import { FC, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import { Stack } from "@mui/material";
import { Identifier } from "../../../../api/borehole.ts";
import {
  convertValueToBoolean,
  ensureDatetime,
  getDecimalsFromNumericString,
  parseFloatWithThousandsSeparator,
} from "../../../../components/form/formUtils.ts";
import { BaseForm } from "../baseForm.tsx";
import IdentifierSegment from "./identifierSegment.tsx";
import { LocationFormInputs, LocationFormSubmission, LocationPanelProps } from "./locationPanelInterfaces.tsx";
import LocationSegment from "./locationSegment.tsx";
import NameSegment from "./nameSegment.tsx";
import RestrictionSegment from "./restrictionSegment.tsx";

export const LocationPanel: FC<LocationPanelProps> = ({ borehole, labelingPanelOpen }) => {
  const [resetKey, setResetKey] = useState(0);
  const formMethods = useForm<LocationFormInputs>({
    mode: "onChange",
    defaultValues: {
      name: borehole.name,
      originalName: borehole.originalName,
      projectName: borehole.projectName,
      restrictionId: borehole.restrictionId,
      restrictionUntil: borehole.restrictionUntil,
      nationalInterest: borehole.nationalInterest === true ? 1 : borehole.nationalInterest === false ? 0 : 2,
      elevationZ: borehole.elevationZ,
      elevationPrecisionId: borehole.elevationPrecisionId,
      referenceElevation: borehole.referenceElevation,
      referenceElevationPrecisionId: borehole.referenceElevationPrecisionId,
      referenceElevationTypeId: borehole.referenceElevationTypeId,
      hrsId: borehole.hrsId,
      country: borehole.country,
      canton: borehole.canton,
      municipality: borehole.municipality,
      locationX: borehole.locationX?.toFixed(borehole.precisionLocationX) ?? "",
      locationY: borehole.locationY?.toFixed(borehole.precisionLocationY) ?? "",
      locationXLV03: borehole.locationXLV03?.toFixed(borehole.precisionLocationXLV03) ?? "",
      locationYLV03: borehole.locationYLV03?.toFixed(borehole.precisionLocationYLV03) ?? "",
      locationPrecisionId: borehole.locationPrecisionId,
      originalReferenceSystem: borehole.originalReferenceSystem,
      boreholeCodelists: borehole?.boreholeCodelists,
    },
  });

  const prepareLocationDataForSubmit = useCallback((formInputs: LocationFormInputs) => {
    const data = { ...formInputs } as LocationFormSubmission;

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
    data.elevationZ = parseFloatWithThousandsSeparator(data?.elevationZ);
    data.referenceElevation = parseFloatWithThousandsSeparator(data?.referenceElevation);
    data.nationalInterest = convertValueToBoolean(data?.nationalInterest);
    data.restrictionId = data.restrictionId ?? null;
    data.referenceElevationTypeId = data.referenceElevationTypeId ?? null;
    data.elevationPrecisionId = data.elevationPrecisionId ?? null;
    data.locationPrecisionId = data.locationPrecisionId ?? null;
    data.referenceElevationPrecisionId = data.referenceElevationPrecisionId ?? null;
    data.name = data?.name ?? data.originalName;
    data.precisionLocationX = data?.locationX ? getDecimalsFromNumericString(formInputs.locationX) : null;
    data.precisionLocationY = data?.locationY ? getDecimalsFromNumericString(formInputs.locationY) : null;
    data.precisionLocationXLV03 = data?.locationXLV03 ? getDecimalsFromNumericString(formInputs.locationXLV03) : null;
    data.precisionLocationYLV03 = data?.locationYLV03 ? getDecimalsFromNumericString(formInputs.locationYLV03) : null;
    data.locationX = parseFloatWithThousandsSeparator(data?.locationX);
    data.locationY = parseFloatWithThousandsSeparator(data?.locationY);
    data.locationXLV03 = parseFloatWithThousandsSeparator(data?.locationXLV03);
    data.locationYLV03 = parseFloatWithThousandsSeparator(data?.locationYLV03);
    data.boreholeCodelists = getCompleteCodelists(data.boreholeCodelists);
    data.profiles = null;
    data.workflow = null;
    return data;
  }, []);

  const onReset = useCallback(() => {
    setResetKey(prev => prev + 1);
  }, [setResetKey]);

  if (borehole)
    return (
      <BaseForm
        formMethods={formMethods}
        prepareDataForSubmit={prepareLocationDataForSubmit}
        onReset={onReset}
        tabStatusToReset="location">
        <Stack gap={3} mr={2}>
          <IdentifierSegment borehole={borehole} formMethods={formMethods}></IdentifierSegment>
          <NameSegment borehole={borehole} formMethods={formMethods}></NameSegment>
          <RestrictionSegment borehole={borehole} formMethods={formMethods}></RestrictionSegment>
          <LocationSegment
            borehole={borehole}
            formMethods={formMethods}
            labelingPanelOpen={labelingPanelOpen}
            key={resetKey}
          />
        </Stack>
      </BaseForm>
    );
};
