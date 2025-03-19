import { useContext, useEffect } from "react";
import { FieldValues, UseFormReturn } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { PromptContext } from "../prompt/promptContext.tsx";
import { DataCardContext, DataCardSwitchContext } from "./dataCardContext.tsx";

interface UseUnsavedChangesPromptProps<T extends FieldValues> {
  formMethods: UseFormReturn<T>;
  submitForm: (data: T) => void;
  translationKey: string;
}

export const useUnsavedChangesPrompt = <T extends FieldValues>({
  formMethods,
  submitForm,
  translationKey,
}: UseUnsavedChangesPromptProps<T>) => {
  const { t } = useTranslation();
  const { checkIsDirty, leaveInput } = useContext(DataCardSwitchContext);
  const { selectCard } = useContext(DataCardContext);
  const { showPrompt } = useContext(PromptContext);

  useEffect(() => {
    if (checkIsDirty) {
      if (Object.keys(formMethods.formState.dirtyFields).length > 0) {
        showPrompt(t("unsavedChangesMessage", { where: t(translationKey) }), [
          {
            label: t("cancel"),
            action: () => leaveInput(false),
          },
          {
            label: t("reset"),
            action: () => {
              formMethods.reset();
              selectCard(null);
              leaveInput(true);
            },
          },
          {
            label: t("save"),
            disabled: !formMethods.formState.isValid,
            action: () => formMethods.handleSubmit(submitForm)(),
          },
        ]);
      } else {
        leaveInput(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkIsDirty]);
};
