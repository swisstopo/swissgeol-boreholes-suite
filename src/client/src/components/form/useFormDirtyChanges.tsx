import { useContext, useEffect } from "react";
import { FieldValues } from "react-hook-form";
import { FormState } from "react-hook-form/dist/types/form";
import { SaveContext } from "../../pages/detail/saveContext.tsx";

interface UseFormDirtyChangesProps<T extends FieldValues> {
  formState: FormState<T>;
}

export const useFormDirtyChanges = <T extends FieldValues>({ formState }: UseFormDirtyChangesProps<T>) => {
  const { markAsChanged } = useContext(SaveContext);

  useEffect(() => {
    markAsChanged(Object.keys(formState.dirtyFields).length > 0);
    return () => markAsChanged(false);
    // formState.isDirty is needed to trigger the effect even though it is not used in the code
  }, [formState.dirtyFields, formState.isDirty, markAsChanged]);
};
