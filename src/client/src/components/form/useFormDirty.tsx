import { useMemo } from "react";
import { FieldValues } from "react-hook-form";
import { FormState } from "react-hook-form/dist/types/form";

interface UseFormDirtyProps<T extends FieldValues> {
  formState: FormState<T>;
}

export const useFormDirty = <T extends FieldValues>({ formState }: UseFormDirtyProps<T>) => {
  // formState.isDirty is needed to trigger the effect even though it is not used in the code
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => Object.keys(formState.dirtyFields).length > 0, [formState.dirtyFields, formState.isDirty]);
};
