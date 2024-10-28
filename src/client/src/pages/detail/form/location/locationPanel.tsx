import { forwardRef, RefObject, useEffect, useImperativeHandle } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { Box, Stack } from "@mui/material";
import { DevTool } from "../../../../../hookformDevtools.ts";
import { Borehole, ReduxRootState } from "../../../../api-lib/ReduxStateInterfaces.ts";
import { BoreholeV2 } from "../../../../api/borehole.ts";
import { useBlockNavigation } from "../../useBlockNavigation.tsx";
import IdentifierSegment from "./identifierSegment.tsx";
import LocationSegment from "./locationSegment.tsx";
import NameSegment from "./nameSegment.tsx";
import RestrictionSegment from "./restrictionSegment.tsx";

interface LocationPanelProps {
  editingEnabled: boolean;
  borehole: BoreholeV2;
  onSubmit: (data: LocationFormInputs) => void;
  onDirtyChange: (isDirty: boolean) => void;
  ref: RefObject<{ submit: () => void; reset: () => void }>;
  updateNumber: (fieldName: keyof Borehole["data"], value: number | null) => void;
}

export interface LocationFormInputs {
  alternateName: string;
  originalName: string;
  projectName: number;
  restrictionId: number | null;
  restrictionUntil: Date | string | null;
  nationalInterest: number | boolean | null; // Number as select options pared to boolean
  elevationZ: number | string | null; // Number with thousands separator then parsed to number
  elevationPrecisionId: number | null;
  referenceElevation: number | string | null; // Number with thousands separator then parsed to number
  qtReferenceElevationId: number | null;
  referenceElevationTypeId: number | null;
  originalReferenceSystem: number | null;
  hrsId?: number;
  locationXLV03: string;
  locationYLV03: string;
  locationY: string;
  locationX: string;
  country: string;
  canton: string;
  municipality: string;
  locationPrecisionId: number | boolean | null | undefined;
}

export interface BoreholeSubmission extends LocationFormInputs {
  precisionLocationX: number | null;
  precisionLocationY: number | null;
  precisionLocationXLV03: number | null;
  precisionLocationYLV03: number | null;
  locationXLV03: string | number | null;
  locationYLV03: string | number | null;
  locationY: string | number | null;
  locationX: string | number | null;
}

export const LocationPanel = forwardRef(
  ({ editingEnabled, onSubmit, updateNumber, onDirtyChange, borehole }: LocationPanelProps, ref) => {
    const formMethods = useForm<LocationFormInputs>({ mode: "all" });
    const legacyBorehole: Borehole = useSelector((state: ReduxRootState) => state.core_borehole);
    const history = useHistory();
    const { handleBlockedNavigation } = useBlockNavigation(formMethods.formState.isDirty);

    history.block(nextLocation => {
      if (!handleBlockedNavigation(nextLocation.pathname)) {
        return false;
      }
    });

    useEffect(() => {
      onDirtyChange(Object.keys(formMethods.formState.dirtyFields).length > 0);
    }, [formMethods.formState.dirtyFields, onDirtyChange]);

    useEffect(() => {
      if (borehole) {
        const nationalInterest = borehole.nationalInterest === true ? 1 : borehole.nationalInterest === false ? 0 : 2;
        // necessary because borehole is not immediately available.

        // really??
        console.log("reset");
        // formMethods.reset({
        //   alternateName: borehole.alternateName,
        //   originalName: borehole.originalName,
        //   projectName: borehole.projectName,
        //   restrictionId: borehole.restrictionId,
        //   restrictionUntil: borehole.restrictionUntil,
        //   nationalInterest: nationalInterest,
        //   elevationZ: borehole.elevationZ,
        //   elevationPrecisionId: borehole.elevationPrecisionId,
        //   referenceElevation: borehole.referenceElevation,
        //   qtReferenceElevationId: borehole.qtReferenceElevationId,
        //   referenceElevationTypeId: borehole.referenceElevationTypeId,
        //   hrsId: borehole.hrsId,
        //   country: borehole.country,
        //   canton: borehole.canton,
        //   municipality: borehole.municipality,
        //   locationX: borehole.locationX?.toString(),
        //   locationY: borehole.locationY?.toString(),
        //   locationXLV03: borehole.locationXLV03?.toString(),
        //   locationYLV03: borehole.locationYLV03?.toString(),
        //   originalReferenceSystem: borehole.originalReferenceSystem,
        // });
      }
    }, [borehole, formMethods]);

    useImperativeHandle(ref, () => ({
      submit: () => {
        const currentValues = formMethods.getValues();
        formMethods.reset(currentValues);
        formMethods.handleSubmit(onSubmit)();
      },
      reset: () => formMethods.reset(),
    }));

    if (borehole)
      return (
        <Box>
          <DevTool control={formMethods.control} placement="top-left" />
          <FormProvider {...formMethods}>
            <form onSubmit={formMethods.handleSubmit(onSubmit)}>
              <Stack gap={3} mr={2}>
                <IdentifierSegment borehole={legacyBorehole} editingEnabled={editingEnabled}></IdentifierSegment>
                <NameSegment
                  borehole={borehole}
                  editingEnabled={editingEnabled}
                  formMethods={formMethods}></NameSegment>
                <RestrictionSegment
                  borehole={borehole}
                  editingEnabled={editingEnabled}
                  formMethods={formMethods}></RestrictionSegment>
                <LocationSegment
                  borehole={borehole}
                  editingEnabled={editingEnabled}
                  formMethods={formMethods}
                  updateNumber={updateNumber}></LocationSegment>
              </Stack>
            </form>
          </FormProvider>
        </Box>
      );
  },
);
