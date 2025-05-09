import { ReactNode, useContext } from "react";
import { FieldValues, FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { DevTool } from "../../../hookformDevtools";
import { useBlockNavigation } from "../../hooks/useBlockNavigation.tsx";
import { useSaveOnCtrlS } from "../../hooks/useSaveOnCtrlS";
import { DetailContext } from "../../pages/detail/detailContext.tsx";
import { FormContainer } from "../form/form";
import { useFormDirtyChanges } from "../form/useFormDirtyChanges.tsx";
import { useValidateFormOnMount } from "../form/useValidateFormOnMount.tsx";
import { DataCardContext } from "./dataCardContext.tsx";
import { DataCardSaveAndCancelButtons } from "./saveAndCancelButtons.tsx";
import { useUnsavedChangesPrompt } from "./useUnsavedChangesPrompt.tsx";

interface DataInputCardProps<T extends FieldValues> {
  item: T;
  addData: (data: T) => Promise<void>;
  updateData: (data: T) => Promise<void>;
  promptLabel: string;
  prepareFormDataForSubmit: (data: T) => T;
  children?: ReactNode;
}

export const DataInputCard = <T extends FieldValues>({
  item,
  addData,
  updateData,
  promptLabel,
  prepareFormDataForSubmit,
  children,
}: DataInputCardProps<T>) => {
  const { triggerReload } = useContext(DataCardContext);
  const { reloadBorehole } = useContext(DetailContext);
  useBlockNavigation();
  const formMethods = useForm<T>({ mode: "all" });
  const { formState, handleSubmit, control } = formMethods;

  const submitForm: SubmitHandler<T> = data => {
    data = prepareFormDataForSubmit(data);
    if (item.id === 0) {
      addData({
        ...data,
      }).then(() => {
        triggerReload();
        reloadBorehole();
      });
    } else {
      updateData({
        ...item,
        ...data,
      }).then(() => {
        triggerReload();
      });
    }
  };

  useUnsavedChangesPrompt({
    formMethods,
    submitForm,
    translationKey: promptLabel,
  });

  useValidateFormOnMount({ formMethods });
  useSaveOnCtrlS(handleSubmit(submitForm));
  useFormDirtyChanges({ formState });

  return (
    <FormProvider {...formMethods}>
      <DevTool control={control} placement="top-left" />
      <form onSubmit={handleSubmit(submitForm)}>
        <FormContainer pt={1}>{children}</FormContainer>
        <DataCardSaveAndCancelButtons formMethods={formMethods} submitForm={submitForm} />
      </form>
    </FormProvider>
  );
};

export default DataInputCard;
