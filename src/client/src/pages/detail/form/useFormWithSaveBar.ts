import { ForwardedRef, useCallback, useEffect, useImperativeHandle } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";
import { useHistory } from "react-router-dom";
import { useBlockNavigation } from "../useBlockNavigation.tsx";

interface UseFormWithSaveBarProps<T extends FieldValues> {
  formMethods: UseFormReturn<T>;
  onDirtyChange: (isDirty: boolean) => void;
  onSubmit: (data: T) => void;
  ref: ForwardedRef<unknown>;
  incrementResetKey?: () => void;
}

export function UseFormWithSaveBar<T extends FieldValues>({
  formMethods,
  onDirtyChange,
  onSubmit,
  incrementResetKey,
  ref,
}: UseFormWithSaveBarProps<T>) {
  const history = useHistory();
  const { handleBlockedNavigation } = useBlockNavigation(formMethods.formState.isDirty);

  // Block navigation if form is dirty
  history.block(nextLocation => {
    if (!handleBlockedNavigation(nextLocation.pathname)) {
      return false;
    }
  });

  // Track form dirty state
  useEffect(() => {
    onDirtyChange(Object.keys(formMethods.formState.dirtyFields).length > 0);
  }, [
    formMethods.formState.dirtyFields,
    formMethods.formState.isDirty,
    formMethods,
    formMethods.formState,
    onDirtyChange,
  ]);

  // Handle form reset and submit
  const resetAndSubmitForm = useCallback(() => {
    const currentValues = formMethods.getValues();
    formMethods.reset(currentValues);
    formMethods.handleSubmit(onSubmit)();
  }, [formMethods, onSubmit]);

  // Save with ctrl+s
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

  // Expose form methods to parent component (save bar)
  useImperativeHandle(ref, () => ({
    submit: () => resetAndSubmitForm(),
    reset: () => {
      formMethods.reset();
      incrementResetKey && incrementResetKey();
    },
  }));
}
