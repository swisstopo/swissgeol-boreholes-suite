import { forwardRef, useCallback, useEffect, useImperativeHandle } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { Box, Stack } from "@mui/material";
import { DevTool } from "../../../../../hookformDevtools.ts";
import { Borehole, ReduxRootState } from "../../../../api-lib/ReduxStateInterfaces.ts";
import { useBlockNavigation } from "../../useBlockNavigation.tsx";
import IdentifierSegment from "./identifierSegment.tsx";
import { LocationFormInputs, LocationPanelProps } from "./locationPanelInterfaces.tsx";
import LocationSegment from "./locationSegment.tsx";
import NameSegment from "./nameSegment.tsx";
import RestrictionSegment from "./restrictionSegment.tsx";

export const LocationPanel = forwardRef(
  ({ editingEnabled, onSubmit, onDirtyChange, borehole }: LocationPanelProps, ref) => {
    const formMethods = useForm<LocationFormInputs>({
      mode: "onChange",
      defaultValues: {
        alternateName: borehole.alternateName,
        originalName: borehole.originalName,
        projectName: borehole.projectName,
        restrictionId: borehole.restrictionId,
        restrictionUntil: borehole.restrictionUntil,
        nationalInterest: borehole.nationalInterest === true ? 1 : borehole.nationalInterest === false ? 0 : 2,
        elevationZ: borehole.elevationZ,
        elevationPrecisionId: borehole.elevationPrecisionId,
        referenceElevation: borehole.referenceElevation,
        qtReferenceElevationId: borehole.qtReferenceElevationId,
        referenceElevationTypeId: borehole.referenceElevationTypeId,
        hrsId: borehole.hrsId,
        country: borehole.country,
        canton: borehole.canton,
        municipality: borehole.municipality,
        locationX: borehole.locationX?.toFixed(borehole.precisionLocationX) || "",
        locationY: borehole.locationY?.toFixed(borehole.precisionLocationY) || "",
        locationXLV03: borehole.locationXLV03?.toFixed(borehole.precisionLocationXLV03) || "",
        locationYLV03: borehole.locationYLV03?.toFixed(borehole.precisionLocationYLV03) || "",
        locationPrecisionId: borehole.locationPrecisionId,
        originalReferenceSystem: borehole.originalReferenceSystem,
      },
    });
    const legacyBorehole: Borehole = useSelector((state: ReduxRootState) => state.core_borehole);
    const history = useHistory();
    const { handleBlockedNavigation } = useBlockNavigation(formMethods.formState.isDirty);

    history.block(nextLocation => {
      if (!handleBlockedNavigation(nextLocation.pathname)) {
        return false;
      }
    });

    const resetAndSubmitForm = useCallback(() => {
      const currentValues = formMethods.getValues();
      formMethods.reset(currentValues);
      formMethods.handleSubmit(onSubmit)();
    }, [formMethods, onSubmit]);

    useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (event.ctrlKey && event.key === "s") {
          event.preventDefault();
          resetAndSubmitForm();
        }
      };
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        window.removeEventListener("keydown", handleKeyDown);
      };
    }, [resetAndSubmitForm]);

    useEffect(() => {
      onDirtyChange(Object.keys(formMethods.formState.dirtyFields).length > 0);
    }, [
      formMethods.formState.dirtyFields,
      formMethods.formState.isDirty,
      formMethods,
      formMethods.formState,
      onDirtyChange,
    ]);

    // expose form methods to parent component
    useImperativeHandle(ref, () => ({
      submit: () => {
        resetAndSubmitForm();
      },
      reset: () => {
        formMethods.reset();
      },
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
                  formMethods={formMethods}></LocationSegment>
              </Stack>
            </form>
          </FormProvider>
        </Box>
      );
  },
);
