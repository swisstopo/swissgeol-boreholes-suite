import { useEffect } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";

interface UseValidateFormOnMountProps<T extends FieldValues> {
  formMethods: UseFormReturn<T>;
}

export const useValidateFormOnMount = <T extends FieldValues>({ formMethods }: UseValidateFormOnMountProps<T>) => {
  useEffect(() => {
    formMethods.trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMethods.trigger]);
};
