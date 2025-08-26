import { ReactNode, useCallback, useContext, useEffect } from "react";
import { FieldValues, FormProvider, UseFormReturn } from "react-hook-form";
import { Box } from "@mui/material";
import { DevTool } from "../../../../hookformDevtools.ts";
import { useBorehole, useBoreholeMutations } from "../../../api/borehole.ts";
import { useFormDirtyChanges } from "../../../components/form/useFormDirtyChanges.tsx";
import { useRequiredParams } from "../../../hooks/useRequiredParams.ts";
import { useResetTabStatus } from "../../../hooks/useResetTabStatus.ts";
import { useLabelingContext } from "../labeling/labelingContext.tsx";
import { SaveContext } from "../saveContext.tsx";
import { TabName } from "./workflow/workflow.ts";

interface BaseFormProps<T extends FieldValues> {
  formMethods: UseFormReturn<T>;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  prepareDataForSubmit: (data: T) => Record<string, any>;
  onReset?: () => void;
  tabStatusToReset: TabName;
  children: ReactNode;
}

export const BaseForm = <T extends FieldValues>({
  formMethods,
  prepareDataForSubmit,
  onReset,
  tabStatusToReset,
  children,
}: BaseFormProps<T>) => {
  const { registerSaveHandler, registerResetHandler, unMount } = useContext(SaveContext);
  const { setExtractionObject } = useLabelingContext();
  const { id } = useRequiredParams<{ id: string }>();
  const { data: borehole } = useBorehole(parseInt(id, 10));
  const {
    update: { mutateAsync: updateBorehole },
  } = useBoreholeMutations();
  const resetTabStatus = useResetTabStatus([tabStatusToReset]);
  const { getValues, reset, formState } = formMethods;
  useFormDirtyChanges({ formState });

  const onSubmit = useCallback(
    async (formInputs: T): Promise<boolean> => {
      try {
        await updateBorehole({
          ...borehole,
          ...prepareDataForSubmit(formInputs),
        });
        return true;
      } catch {
        return false;
      }
    },
    [updateBorehole, borehole, prepareDataForSubmit],
  );

  const resetAndSubmitForm = useCallback(async () => {
    const currentValues = getValues();
    reset(currentValues);
    setExtractionObject(undefined);
    resetTabStatus();
    return await onSubmit(currentValues);
  }, [getValues, onSubmit, reset, resetTabStatus, setExtractionObject]);

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
