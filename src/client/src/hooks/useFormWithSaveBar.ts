import { Ref, useCallback, useEffect, useImperativeHandle } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";
import { useFormDirtyStore } from "../pages/detail/formDirtyStore.ts";
import { useLabelingContext } from "../pages/detail/labeling/labelingContext.tsx";
import { useSaveBarState } from "../pages/detail/saveBarStore.ts";
import { useBlockNavigation } from "./useBlockNavigation.tsx";
import { useSaveOnCtrlS } from "./useSaveOnCtrlS.ts";

interface UseFormWithSaveBarProps<T extends FieldValues> {
  formMethods: UseFormReturn<T>;
  onSubmit: (data: T) => void;
  ref: Ref<unknown>;
  incrementResetKey?: () => void;
}

export function UseFormWithSaveBar<T extends FieldValues>({
  formMethods,
  onSubmit,
  incrementResetKey,
  ref,
}: UseFormWithSaveBarProps<T>) {
  useBlockNavigation();
  const setIsFormDirty = useFormDirtyStore(state => state.setIsFormDirty);
  const { setExtractionObject } = useLabelingContext();
  const setShowSaveFeedback = useSaveBarState(state => state.setShowSaveFeedback);

  // Track form dirty state
  useEffect(() => {
    setIsFormDirty(Object.keys(formMethods.formState.dirtyFields).length > 0);
    return () => setIsFormDirty(false);
  }, [
    formMethods.formState.dirtyFields,
    formMethods.formState.isDirty,
    formMethods,
    formMethods.formState,
    setIsFormDirty,
  ]);

  // Handle form reset and submit
  const resetAndSubmitForm = useCallback(() => {
    const currentValues = formMethods.getValues();
    formMethods.reset(currentValues);
    setExtractionObject(undefined);
    onSubmit(currentValues);
  }, [formMethods, onSubmit, setExtractionObject]);

  const saveAndShowFeedback = useCallback(() => {
    setShowSaveFeedback(true);
    resetAndSubmitForm();
    setTimeout(() => setShowSaveFeedback(false), 4000);
  }, [resetAndSubmitForm, setShowSaveFeedback]);

  // Save with ctrl+s
  useSaveOnCtrlS(saveAndShowFeedback);

  // Expose form methods to parent component (save bar)
  useImperativeHandle(ref, () => {
    return {
      submit: () => saveAndShowFeedback(),
      reset: () => {
        formMethods.reset();
        setExtractionObject(undefined);
        if (incrementResetKey) incrementResetKey();
      },
    };
  }, [formMethods, incrementResetKey, saveAndShowFeedback, setExtractionObject]);
}
