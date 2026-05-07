import { FC, useCallback, useContext, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { ApiError } from "../../../../api/apiInterfaces.ts";
import { Stratigraphy, useStratigraphyMutations } from "../../../../api/stratigraphy.ts";
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
  const {
    update: { mutateAsync: updateStratigraphy },
  } = useStratigraphyMutations();
  const formMethods = useForm<Stratigraphy>({ mode: "all" });
  const { formState, getValues } = formMethods;
  useFormDirtyMarkAsChanged({ formState });
  const { registerSaveHandler, registerResetHandler } = useContext<StratigraphyContextProps>(StratigraphyContext);
  const showApiErrorAlert = useApiErrorAlert();

  const resetForm = useCallback(() => {
    if (selectedStratigraphy) {
      formMethods.reset({
        ...selectedStratigraphy,
        date: selectedStratigraphy.date?.toString().slice(0, 10) ?? "",
      });
    }
  }, [formMethods, selectedStratigraphy]);

  const onSave = useCallback(async () => {
    if (!selectedStratigraphy) return false;

    const values = getValues();
    values.date = values.date ? ensureDatetime(values.date.toString()) : null;
    await updateStratigraphy(
      { ...selectedStratigraphy, ...values },
      {
        onError: (error: ApiError) => {
          if (error.messageKey === "mustBeUnique") {
            formMethods.setError("name", { type: "manual", message: t(error.messageKey) });
          } else {
            showApiErrorAlert(error);
          }
        },
      },
    );
    return true;
  }, [formMethods, getValues, selectedStratigraphy, showApiErrorAlert, t, updateStratigraphy]);

  useEffect(() => {
    registerSaveHandler(onSave, "stratigraphy");
    registerResetHandler(resetForm, "stratigraphy");
  }, [onSave, registerResetHandler, registerSaveHandler, resetForm]);

  useEffect(() => {
    resetForm();
  }, [resetForm]);

  return (
    <FormProvider {...formMethods}>
      <FormContainer direction={"row"}>
        <FormInput
          fieldName={"name"}
          label={"stratigraphy_name"}
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
