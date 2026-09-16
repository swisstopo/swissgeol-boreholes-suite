import { useContext, useEffect, useState } from "react";
import { FieldValues, FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { CircularProgress } from "@mui/material";
import { Completion } from "../../../../api/generated";
import { useCodelistSchema } from "../../../../components/codelist.ts";
import { SaveAndCancelButtons } from "../../../../components/dataCard/saveAndCancelButtons.tsx";
import {
  FormCheckbox,
  FormContainer,
  FormDomainSelect,
  FormInput,
  FormValueType,
} from "../../../../components/form/form";
import { useValidateFormOnMount } from "../../../../components/form/useValidateFormOnMount.tsx";
import { PromptContext } from "../../../../components/prompt/promptContext.tsx";
import { FullPageCentered } from "../../../../components/styledComponents.ts";
import { useResetTabStatus } from "../../../../hooks/useResetTabStatus.ts";
import { CompletionHeaderInputProps } from "./completionInterfaces.ts";
import { completionSchemaConstants } from "./completionSchemaConstants.ts";

const CompletionHeaderInput = ({
  completion,
  cancelChanges,
  saveCompletion,
  trySwitchTab,
  confirmTabSwitch,
  cancelTabSwitch,
}: CompletionHeaderInputProps) => {
  const { showPrompt } = useContext(PromptContext);
  const formMethods = useForm({ mode: "all" });
  const { t } = useTranslation();
  const { data: schemaData, isLoading } = useCodelistSchema(completionSchemaConstants.completionKind);
  const resetTabStatus = useResetTabStatus(["casing", "instrumentation", "backfill"]);

  const [selectedCompletion, setSelectedCompletion] = useState<Completion>({
    ...completion,
  });

  useValidateFormOnMount({ formMethods });

  useEffect(() => {
    setSelectedCompletion(completion);
  }, [completion]);

  useEffect(() => {
    formMethods.reset({
      ...selectedCompletion,
    });
  }, [formMethods, selectedCompletion]);

  const submitForm = (data: FieldValues) => {
    if (data?.abandonDate === "") {
      data.abandonDate = null;
    }
    if (data?.isPrimary === undefined) {
      data.isPrimary = completion.isPrimary;
    }
    saveCompletion({ ...completion, ...data });
  };

  useEffect(() => {
    if (trySwitchTab) {
      if (Object.keys(formMethods.formState.dirtyFields).length > 0) {
        showPrompt(t("unsavedChangesMessage", { where: t("completion") }), [
          {
            label: "cancel",
            action: () => {
              cancelTabSwitch();
            },
          },
          {
            label: "reset",
            action: () => {
              formMethods.reset(selectedCompletion);
              confirmTabSwitch();
            },
          },
          {
            label: t("save"),
            disabled: !formMethods.formState.isValid,
            action: () => {
              // Not awaited: the prompt action returns void and handleSubmit reports errors
              // through form state.
              void formMethods.handleSubmit(submitForm)();
            },
          },
        ]);
      } else {
        confirmTabSwitch();
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trySwitchTab]);

  if (isLoading)
    return (
      <FullPageCentered>
        <CircularProgress />
      </FullPageCentered>
    );

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={event => void formMethods.handleSubmit(submitForm)(event)}>
        <FormContainer>
          <FormContainer
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            flexWrap="wrap"
            marginRight={"10px"}>
            <FormInput
              fieldName="name"
              label="name"
              required={true}
              value={selectedCompletion?.name}
              sx={{ flex: "1 1 180px" }}
            />
            <FormDomainSelect
              fieldName="kindId"
              label="completionKind"
              selected={selectedCompletion?.kindId}
              required={true}
              schemaName={completionSchemaConstants.completionKind}
              prefilteredDomains={schemaData}
            />
          </FormContainer>
          <FormContainer direction="row" justifyContent="space-between" flexWrap="wrap">
            <FormInput
              fieldName="notes"
              label="notes"
              multiline={true}
              value={selectedCompletion?.notes}
              sx={{ flex: "1 1 180px" }}
            />
            <FormInput
              fieldName="abandonDate"
              label="dateAbandonmentCompletion"
              type={FormValueType.Date}
              value={selectedCompletion?.abandonDate}
            />
          </FormContainer>
          <FormContainer direction="row-reverse" justifyContent="space-between" flexWrap="wrap">
            <FormCheckbox fieldName="isPrimary" label="mainCompletion" disabled={completion.isPrimary} />
          </FormContainer>
          <SaveAndCancelButtons
            onCancel={() => {
              formMethods.reset(selectedCompletion);
              cancelChanges();
            }}
            onSave={() => {
              resetTabStatus();
              return formMethods.handleSubmit(submitForm)();
            }}
            saveDisabled={!formMethods.formState.isValid}
          />
        </FormContainer>
      </form>
    </FormProvider>
  );
};
export default CompletionHeaderInput;
