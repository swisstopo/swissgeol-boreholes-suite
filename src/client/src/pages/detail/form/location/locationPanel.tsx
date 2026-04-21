import { FC, useCallback, useState } from "react";
import { useForm } from "react-hook-form";
import {
  getDecimalsFromNumericString,
  parseFloatWithThousandsSeparator,
} from "../../../../components/form/formUtils.ts";
import { BaseForm } from "../baseForm.tsx";
import { LocationFormInputs, LocationFormSubmission, LocationPanelProps } from "./locationPanelInterfaces.tsx";
import LocationSegment from "./locationSegment.tsx";

export const LocationPanel: FC<LocationPanelProps> = ({ borehole, labelingPanelOpen }) => {
  const [resetKey, setResetKey] = useState(0);
  const formMethods = useForm<LocationFormInputs>({
    mode: "onChange",
    defaultValues: {
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
    },
  });

  const prepareLocationDataForSubmit = useCallback((formInputs: LocationFormInputs) => {
    const data = { ...formInputs } as LocationFormSubmission;
    data.elevationZ = parseFloatWithThousandsSeparator(data?.elevationZ);
    data.referenceElevation = parseFloatWithThousandsSeparator(data?.referenceElevation);
    data.referenceElevationTypeId = data.referenceElevationTypeId ?? null;
    data.elevationPrecisionId = data.elevationPrecisionId ?? null;
    data.locationPrecisionId = data.locationPrecisionId ?? null;
    data.referenceElevationPrecisionId = data.referenceElevationPrecisionId ?? null;
    data.precisionLocationX = data?.locationX ? getDecimalsFromNumericString(formInputs.locationX) : null;
    data.precisionLocationY = data?.locationY ? getDecimalsFromNumericString(formInputs.locationY) : null;
    data.precisionLocationXLV03 = data?.locationXLV03 ? getDecimalsFromNumericString(formInputs.locationXLV03) : null;
    data.precisionLocationYLV03 = data?.locationYLV03 ? getDecimalsFromNumericString(formInputs.locationYLV03) : null;
    data.locationX = parseFloatWithThousandsSeparator(data?.locationX);
    data.locationY = parseFloatWithThousandsSeparator(data?.locationY);
    data.locationXLV03 = parseFloatWithThousandsSeparator(data?.locationXLV03);
    data.locationYLV03 = parseFloatWithThousandsSeparator(data?.locationYLV03);
    data.boreholeFiles = null;
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
        <LocationSegment
          borehole={borehole}
          formMethods={formMethods}
          labelingPanelOpen={labelingPanelOpen}
          key={resetKey}
        />
      </BaseForm>
    );
};
