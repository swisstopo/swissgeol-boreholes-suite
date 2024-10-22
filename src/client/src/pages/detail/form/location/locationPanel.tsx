import { forwardRef, RefObject, useEffect, useImperativeHandle, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useParams } from "react-router-dom";
import { Box, Stack } from "@mui/material";
import { DevTool } from "../../../../../hookformDevtools.ts";
import { Borehole, ReduxRootState } from "../../../../api-lib/ReduxStateInterfaces.ts";
import { BoreholeV2, getBoreholeById } from "../../../../api/borehole.ts";
import IdentifierSegment from "./identifierSegment.tsx";
import LocationSegment from "./locationSegment.tsx";
import NameSegment from "./nameSegment.tsx";
import RestrictionSegment from "./restrictionSegment.tsx";

interface LocationPanelProps {
  editingEnabled: boolean;
  onSubmit: (data: LocationFormInputs) => void;
  onDirtyChange: (isDirty: boolean) => void;
  ref: RefObject<{ submit: () => void; reset: () => void }>;
  updateNumber: (fieldName: keyof Borehole["data"], value: number | null) => void;
  updateChange: (
    fieldName: keyof Borehole["data"],
    value: string | number | boolean | null | (number | string | null)[],
    to?: boolean,
  ) => void;
}

export interface LocationFormInputs {
  alternateName: string;
  originalName: string;
  projectName: number;
  restrictionId: number | null;
  restrictionUntil: Date | string | null;
  nationalInterest: number | boolean | null; // Number as select options pared to boolean
  elevationZ: number | string; // Number with thousands separator then parsed to number
  elevationPrecisionId: number | null;
  referenceElevation: number | string; // Number with thousands separator then parsed to number
  qtReferenceElevationId: number | null;
  referenceElevationTypeId: number | null;
  hrsId?: number;
}

export const LocationPanel = forwardRef(
  ({ editingEnabled, onSubmit, updateNumber, updateChange, onDirtyChange }: LocationPanelProps, ref) => {
    const formMethods = useForm<LocationFormInputs>({ mode: "all" });
    const legacyBorehole: Borehole = useSelector((state: ReduxRootState) => state.core_borehole);
    const { id } = useParams<{
      id: string;
    }>();
    const [borehole, setBorehole] = useState<BoreholeV2>();

    useEffect(() => {
      getBoreholeById(parseInt(id)).then(b => {
        setBorehole(b);
      });
    }, [id]);

    useEffect(() => {
      onDirtyChange(formMethods.formState.isDirty);
    }, [formMethods.formState.isDirty, onDirtyChange]);

    useEffect(() => {
      if (borehole) {
        // necessary because borehole is not immediately available.
        formMethods.reset({
          alternateName: borehole.alternateName,
          originalName: borehole.originalName,
          projectName: borehole.projectName,
          restrictionId: borehole.restrictionId,
          restrictionUntil: borehole.restrictionUntil,
          nationalInterest: borehole.nationalInterest,
          elevationZ: borehole.elevationZ,
          elevationPrecisionId: borehole.elevationPrecisionId,
          referenceElevation: borehole.referenceElevation,
          qtReferenceElevationId: borehole.qtReferenceElevationId,
          referenceElevationTypeId: borehole.referenceElevationTypeId,
          hrsId: borehole.hrsId,
          country: borehole.country,
          canton: borehole.canton,
          municipality: borehole.municipality,
        });
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
                  updateChange={updateChange}
                  updateNumber={updateNumber}></LocationSegment>
              </Stack>
            </form>
          </FormProvider>
        </Box>
      );
  },
);
