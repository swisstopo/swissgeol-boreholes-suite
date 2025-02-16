import { forwardRef, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { Box, Stack } from "@mui/material";
import { DevTool } from "../../../../../hookformDevtools.ts";
import { UseFormWithSaveBar } from "../../../../hooks/useFormWithSaveBar.ts";
import IdentifierSegment from "./identifierSegment.tsx";
import { LocationFormInputs, LocationPanelProps } from "./locationPanelInterfaces.tsx";
import LocationSegment from "./locationSegment.tsx";
import NameSegment from "./nameSegment.tsx";
import RestrictionSegment from "./restrictionSegment.tsx";

export const LocationPanel = forwardRef(({ onSubmit, borehole, labelingPanelOpen }: LocationPanelProps, ref) => {
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

  const incrementResetKey = () => setResetKey(prev => prev + 1);

  UseFormWithSaveBar({
    formMethods,
    onSubmit,
    ref,
    incrementResetKey,
  });

  if (borehole)
    return (
      <Box>
        <DevTool control={formMethods.control} placement="top-left" />
        <FormProvider {...formMethods}>
          <form onSubmit={formMethods.handleSubmit(onSubmit)}>
            <Stack gap={3} mr={2}>
              <IdentifierSegment borehole={borehole} formMethods={formMethods}></IdentifierSegment>
              <NameSegment borehole={borehole} formMethods={formMethods}></NameSegment>
              <RestrictionSegment borehole={borehole} formMethods={formMethods}></RestrictionSegment>
              <LocationSegment
                borehole={borehole}
                formMethods={formMethods}
                labelingPanelOpen={labelingPanelOpen}
                key={resetKey}></LocationSegment>
            </Stack>
          </form>
        </FormProvider>
      </Box>
    );
});
