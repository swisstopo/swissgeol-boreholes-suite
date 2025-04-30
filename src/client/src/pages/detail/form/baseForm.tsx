import { ReactNode, useCallback, useContext, useEffect } from "react";
import { FieldValues, FormProvider, UseFormReturn } from "react-hook-form";
import { Box } from "@mui/material";
import { DevTool } from "../../../../hookformDevtools.ts";
import { getBoreholeById, updateBorehole } from "../../../api/borehole.ts";
import { useBlockNavigation } from "../../../hooks/useBlockNavigation.tsx";
import { useLabelingContext } from "../labeling/labelingContext.tsx";
import { SaveContext } from "../saveContext.tsx";

interface BaseFormProps<T extends FieldValues> {
  boreholeId: number;
  formMethods: UseFormReturn<T>;
  prepareDataForSubmit: (data: T) => Record<string, unknown>;
  onReset?: () => void;
  children: ReactNode;
}

export const BaseForm = <T extends FieldValues>({
  boreholeId,
  formMethods,
  prepareDataForSubmit,
  onReset,
  children,
}: BaseFormProps<T>) => {
  const { markAsChanged, registerSaveHandler, registerResetHandler, unMount } = useContext(SaveContext);
  const { setExtractionObject } = useLabelingContext();
  const { getValues, reset, formState } = formMethods;
  useBlockNavigation();

  const onSubmit = useCallback(
    async (formInputs: T) => {
      const currentBorehole = await getBoreholeById(boreholeId);
      await updateBorehole({
        ...currentBorehole,
        ...prepareDataForSubmit(formInputs),
      });
    },
    [boreholeId, prepareDataForSubmit],
  );

  const resetAndSubmitForm = useCallback(async () => {
    const currentValues = getValues();
    reset(currentValues);
    setExtractionObject(undefined);
    await onSubmit(currentValues);
  }, [getValues, onSubmit, reset, setExtractionObject]);

  const resetWithoutSave = useCallback(() => {
    reset();
    setExtractionObject(undefined);
    if (onReset) onReset();
  }, [onReset, reset, setExtractionObject]);

  useEffect(() => {
    registerSaveHandler(resetAndSubmitForm);
    registerResetHandler(resetWithoutSave);

    return () => {
      unMount();
    };
  }, [registerResetHandler, registerSaveHandler, resetAndSubmitForm, resetWithoutSave, unMount]);

  useEffect(() => {
    markAsChanged(Object.keys(formState.dirtyFields).length > 0);
    return () => markAsChanged(false);
    // formState.isDirty is needed to trigger the effect even though it is not used in the code
  }, [formState.dirtyFields, formState.isDirty, markAsChanged]);

  return (
    <Box>
      <DevTool control={formMethods.control} placement="top-right" />
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>{children}</form>
      </FormProvider>
    </Box>
  );
};
