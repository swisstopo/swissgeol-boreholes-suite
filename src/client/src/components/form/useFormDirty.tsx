import { useContext, useEffect, useMemo } from "react";
import { FieldValues } from "react-hook-form";
import { FormState } from "react-hook-form/dist/types/form";
import { SaveContext } from "../../pages/detail/saveContext.tsx";

interface UseFormDirtyProps<T extends FieldValues> {
  formState: FormState<T>;
}

/**
 * Returns true if the form is dirty (i.e. any field has been modified).
 * @param formState
 */
export const useFormDirty = <T extends FieldValues>({ formState }: UseFormDirtyProps<T>) => {
  // formState.isDirty is needed to trigger the effect even though it is not used in the code
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useMemo(() => Object.keys(formState.dirtyFields).length > 0, [formState.dirtyFields, formState.isDirty]);
};

/**
 * Marks the form as changed in the SaveContext when it is dirty.
 * @param formState
 */
export const useFormDirtyMarkAsChanged = <T extends FieldValues>({ formState }: UseFormDirtyProps<T>) => {
  const { markAsChanged } = useContext(SaveContext);
  const isDirty = useFormDirty({ formState });

  useEffect(() => {
    markAsChanged(isDirty);
    return () => markAsChanged(false);
  }, [isDirty, markAsChanged]);
};
