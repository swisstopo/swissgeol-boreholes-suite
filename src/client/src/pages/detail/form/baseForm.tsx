import { ReactNode, useCallback, useContext, useEffect, useMemo } from "react";
import { FieldValues, FormProvider, UseFormReturn } from "react-hook-form";
import { Box } from "@mui/material";
import { DevTool } from "../../../../hookformDevtools.ts";
import { getBoreholeById, updateBorehole } from "../../../api/borehole.ts";
import { useFormDirtyChanges } from "../../../components/form/useFormDirtyChanges.tsx";
import { useBlockNavigation } from "../../../hooks/useBlockNavigation.tsx";
import { useRequiredParams } from "../../../hooks/useRequiredParams.ts";
import { useLabelingContext } from "../labeling/labelingContext.tsx";
import { SaveContext } from "../saveContext.tsx";

interface BaseFormProps<T extends FieldValues> {
  formMethods: UseFormReturn<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prepareDataForSubmit: (data: T) => Record<string, any>;
  onReset?: () => void;
  children: ReactNode;
}

export const BaseForm = <T extends FieldValues>({
  formMethods,
  prepareDataForSubmit,
  onReset,
  children,
}: BaseFormProps<T>) => {
  const { registerSaveHandler, registerResetHandler, unMount } = useContext(SaveContext);
  const { setExtractionObject } = useLabelingContext();
  const { id } = useRequiredParams<{ id: string }>();
  const { getValues, reset, formState } = formMethods;
  useBlockNavigation();
  useFormDirtyChanges({ formState });

  const boreholeId = useMemo(() => parseInt(id, 10), [id]);

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

  return (
    <Box>
      <DevTool control={formMethods.control} placement="top-right" />
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>{children}</form>
      </FormProvider>
    </Box>
  );
};
