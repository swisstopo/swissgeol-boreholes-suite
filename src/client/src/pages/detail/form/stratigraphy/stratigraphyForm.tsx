import { FC, useCallback, useContext, useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Stratigraphy, useStratigraphyMutations } from "../../../../api/stratigraphy.ts";
import { FormValueType } from "../../../../components/form/form.ts";
import { FormCheckbox } from "../../../../components/form/formCheckbox.tsx";
import { FormContainer } from "../../../../components/form/formContainer.tsx";
import { FormInput } from "../../../../components/form/formInput.tsx";
import { ensureDatetime } from "../../../../components/form/formUtils.ts";
import { useFormDirtyChanges } from "../../../../components/form/useFormDirtyChanges.tsx";
import { useApiErrorAlert } from "../../../../hooks/useShowAlertOnError.tsx";
import { StratigraphyContext, StratigraphyContextProps } from "./stratigraphyContext.tsx";

interface StratigraphyFormProps {
  selectedStratigraphy: Stratigraphy;
  stratigraphyCount: number;
  navigateToStratigraphy: (stratigraphyId: number | undefined, replace?: boolean) => void;
}

export const StratigraphyForm: FC<StratigraphyFormProps> = ({
  selectedStratigraphy,
  stratigraphyCount,
  navigateToStratigraphy,
}) => {
  const { t } = useTranslation();
  const {
    add: { mutateAsync: addStratigraphy },
    update: { mutateAsync: updateStratigraphy },
  } = useStratigraphyMutations();
  const formMethods = useForm<Stratigraphy>({ mode: "all" });
  const { formState, getValues } = formMethods;
  useFormDirtyChanges({ formState });
  const { registerSaveHandler, registerResetHandler } = useContext<StratigraphyContextProps>(StratigraphyContext);
  const showApiErrorAlert = useApiErrorAlert();

  const resetForm = useCallback(() => {
    formMethods.reset({
      ...selectedStratigraphy,
      date: selectedStratigraphy.date?.toString().slice(0, 10) ?? "",
    });
  }, [formMethods, selectedStratigraphy]);

  const resetWithoutSave = useCallback(() => {
    if (selectedStratigraphy.id === 0) {
      navigateToStratigraphy(undefined, true);
    } else {
      resetForm();
    }
  }, [navigateToStratigraphy, resetForm, selectedStratigraphy]);

  const handleSaveError = useCallback(
    (error: Error) => {
      if (error.message.includes("Name must be unique")) {
        formMethods.setError("name", { type: "manual", message: t("mustBeUnique") });
      } else {
        showApiErrorAlert(error);
      }
    },
    [formMethods, showApiErrorAlert, t],
  );

  const onSave = useCallback(async () => {
    const values = getValues();
    values.date = values.date ? ensureDatetime(values.date.toString()) : null;

    try {
      if (values.id === 0) {
        const newStratigraphy: Stratigraphy = await addStratigraphy(values);
        navigateToStratigraphy(newStratigraphy.id, true);
      } else {
        await updateStratigraphy({ ...selectedStratigraphy, ...values });
      }
      return true;
    } catch (error) {
      handleSaveError(error as Error);
      return false;
    }
  }, [addStratigraphy, getValues, handleSaveError, navigateToStratigraphy, selectedStratigraphy, updateStratigraphy]);

  useEffect(() => {
    registerSaveHandler(onSave);
    registerResetHandler(resetWithoutSave);
  }, [onSave, registerResetHandler, registerSaveHandler, resetWithoutSave]);

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
          required={true}
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
