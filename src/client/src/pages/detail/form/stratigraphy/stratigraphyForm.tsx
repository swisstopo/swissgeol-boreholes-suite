import { FC, useCallback, useContext, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ApiError } from "../../../../api/errorClasses.ts";
import { Stratigraphy } from "../../../../api/generated";
import { FormValueType } from "../../../../components/form/form.ts";
import { FormCheckbox } from "../../../../components/form/formCheckbox.tsx";
import { FormContainer } from "../../../../components/form/formContainer.tsx";
import { FormInput } from "../../../../components/form/formInput.tsx";
import { ensureDatetime } from "../../../../components/form/formUtils.ts";
import { useFormDirtyMarkAsChanged } from "../../../../components/form/useFormDirty.tsx";
import { useApiErrorAlert } from "../../../../hooks/useShowAlertOnError.tsx";
import { StratigraphyContext, StratigraphyContextProps } from "./stratigraphyContext.tsx";

interface StratigraphyFormProps {
  selectedStratigraphy: Stratigraphy;
  stratigraphyCount: number;
}

export const StratigraphyForm: FC<StratigraphyFormProps> = ({ selectedStratigraphy, stratigraphyCount }) => {
  const { t } = useTranslation();
  const formMethods = useForm<Stratigraphy>({ mode: "all" });
  const { formState, getValues } = formMethods;
  useFormDirtyMarkAsChanged({ formState });
  const { registerHeader } = useContext<StratigraphyContextProps>(StratigraphyContext);
  const showApiErrorAlert = useApiErrorAlert();

  const resetForm = useCallback(() => {
    if (selectedStratigraphy) {
      formMethods.reset({
        ...selectedStratigraphy,
        date: selectedStratigraphy.date?.toString().slice(0, 10) ?? "",
      });
    }
  }, [formMethods, selectedStratigraphy]);

  const getPayload = useCallback((): Stratigraphy => {
    const values = getValues();
    const date = values.date ? ensureDatetime(values.date.toString()) : null;
    return { ...selectedStratigraphy, ...values, date };
  }, [getValues, selectedStratigraphy]);

  const onSaveError = useCallback(
    (error: ApiError) => {
      if (error.messageKey === "mustBeUnique") {
        formMethods.setError("name", { type: "manual", message: t(error.messageKey) });
      } else {
        showApiErrorAlert(error);
      }
    },
    [formMethods, showApiErrorAlert, t],
  );

  useEffect(() => {
    registerHeader({ getPayload, onSaveError, reset: resetForm });
  }, [getPayload, onSaveError, resetForm, registerHeader]);

  useEffect(() => {
    resetForm();
  }, [resetForm]);

  return (
    <FormProvider {...formMethods}>
      <FormContainer direction={"row"}>
        <FormInput
          fieldName={"name"}
          label={"nameOrVersion"}
          value={selectedStratigraphy.name}
          type={FormValueType.Text}
          onUpdate={() => formMethods.clearErrors("name")}
        />
        <FormInput
          fieldName={"date"}
          label="date"
          value={selectedStratigraphy.date?.toString().slice(0, 10) ?? ""}
          type={FormValueType.Date}
        />
        {stratigraphyCount > 1 && (
          <FormCheckbox fieldName={"isPrimary"} label={"mainStratigraphy"} disabled={selectedStratigraphy.isPrimary} />
        )}
      </FormContainer>
    </FormProvider>
  );
};
