import { useEffect } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";

interface UseValidateFormOnMountProps<T extends FieldValues> {
  formMethods: UseFormReturn<T>;
}

export const useValidateFormOnMount = <T extends FieldValues>({ formMethods }: UseValidateFormOnMountProps<T>) => {
  useEffect(() => {
    // Not awaited: effects cannot be async, and the validation result is read from form state.
    void formMethods.trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMethods.trigger]);
};
