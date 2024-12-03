import { ForwardedRef, useCallback, useEffect, useImperativeHandle } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { useBlockNavigation } from "../useBlockNavigation.tsx";
import { useFormDirty } from "../useFormDirty.tsx";
import { useSaveOnKeyDown } from "../useSaveOnCtrlS.ts";

interface UseFormWithSaveBarProps<T extends FieldValues> {
  formMethods: UseFormReturn<T>;
  onSubmit: (data: T) => void;
  ref: ForwardedRef<unknown>;
  incrementResetKey?: () => void;
}

export function UseFormWithSaveBar<T extends FieldValues>({
  formMethods,
  onSubmit,
  incrementResetKey,
  ref,
}: UseFormWithSaveBarProps<T>) {
  const history = useHistory();
  const { handleBlockedNavigation } = useBlockNavigation();
  const { setIsFormDirty } = useFormDirty();

  // Block navigation if form is dirty
  history.block(nextLocation => {
    if (!handleBlockedNavigation(nextLocation.pathname)) {
      return false;
    }
  });

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
    formMethods.handleSubmit(onSubmit)();
  }, [formMethods, onSubmit]);

  // Save with ctrl+s
  useSaveOnKeyDown(resetAndSubmitForm);

  // Expose form methods to parent component (save bar)
  useImperativeHandle(ref, () => ({
    submit: () => resetAndSubmitForm(),
    reset: () => {
      formMethods.reset();
      incrementResetKey && incrementResetKey();
    },
  }));
}
