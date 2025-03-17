import { ReactNode, useContext, useEffect } from "react";
import { FieldValues, FormProvider, SubmitHandler, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { DevTool } from "../../../hookformDevtools";
import { useSaveOnCtrlS } from "../../hooks/useSaveOnCtrlS";
import { CancelButton, SaveButton } from "../buttons/buttons.tsx";
import { FormContainer } from "../form/form";
import { PromptContext } from "../prompt/promptContext.tsx";
import { DataCardButtonContainer } from "./dataCard.js";
import { DataCardContext, DataCardSwitchContext } from "./dataCardContext.tsx";

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
  const { t } = useTranslation();
  const { triggerReload, selectCard } = useContext(DataCardContext);
  const { checkIsDirty, leaveInput } = useContext(DataCardSwitchContext);
  const { showPrompt } = useContext(PromptContext);
  const formMethods = useForm<T>({ mode: "all" });

  useEffect(() => {
    if (checkIsDirty) {
      if (Object.keys(formMethods.formState.dirtyFields).length > 0) {
        showPrompt(t("unsavedChangesMessage", { where: t(promptLabel) }), [
          {
            label: t("cancel"),
            action: () => {
              leaveInput(false);
            },
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
            action: () => {
              formMethods.handleSubmit(submitForm)();
            },
          },
        ]);
      } else {
        leaveInput(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkIsDirty]);

  // trigger form validation on mount
  useEffect(() => {
    formMethods.trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMethods.trigger]);

  const submitForm: SubmitHandler<T> = data => {
    data = prepareFormDataForSubmit(data);
    if (item.id === 0) {
      addData({
        ...data,
      }).then(() => {
        triggerReload();
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

  // Save with ctrl+s
  useSaveOnCtrlS(formMethods.handleSubmit(submitForm));

  return (
    <>
      <FormProvider {...formMethods}>
        <DevTool control={formMethods.control} placement="top-left" />
        <form onSubmit={formMethods.handleSubmit(submitForm)}>
          <FormContainer pt={1}>{children}</FormContainer>
          <DataCardButtonContainer>
            <CancelButton
              onClick={() => {
                formMethods.reset();
                selectCard(null);
              }}
            />
            <SaveButton
              disabled={!formMethods.formState.isValid}
              onClick={() => formMethods.handleSubmit(submitForm)()}
            />
          </DataCardButtonContainer>
        </form>
      </FormProvider>
    </>
  );
};

export default DataInputCard;
