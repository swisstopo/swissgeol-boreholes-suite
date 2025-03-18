import { useContext, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { fetchApiV2 } from "../../../../api/fetchApiV2.js";
import { SaveAndCancelButtons } from "../../../../components/dataCard/saveAndCancelButtons.js";
import {
  FormCheckbox,
  FormContainer,
  FormDomainSelect,
  FormInput,
  FormValueType,
} from "../../../../components/form/form";
import { PromptContext } from "../../../../components/prompt/promptContext.tsx";
import { completionSchemaConstants } from "./completionSchemaConstants.js";

const CompletionHeaderInput = props => {
  const { completion, cancelChanges, saveCompletion, trySwitchTab, switchTabs } = props;
  const { showPrompt } = useContext(PromptContext);
  const formMethods = useForm({ mode: "all" });
  const { t } = useTranslation();
  const [kindOptions, setKindOptions] = useState();

  const loadKindOptions = async () => {
    const response = await fetchApiV2(`codelist?schema=${completionSchemaConstants.completionKind}`, "GET");
    if (response) {
      setKindOptions(response);
    }
  };

  useEffect(() => {
    if (kindOptions === undefined) {
      loadKindOptions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const [selectedCompletion, setSelectedCompletion] = useState({
    ...completion,
  });

  // trigger form validation on mount
  useEffect(() => {
    formMethods.trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMethods.trigger]);

  useEffect(() => {
    setSelectedCompletion(completion);
  }, [completion]);

  useEffect(() => {
    if (trySwitchTab) {
      if (Object.keys(formMethods.formState.dirtyFields).length > 0) {
        showPrompt(t("unsavedChangesMessage", { where: t("completion") }), [
          {
            label: t("cancel"),
            action: () => {
              switchTabs(false);
            },
          },
          {
            label: t("reset"),
            action: () => {
              formMethods.reset(selectedCompletion);
              switchTabs(true);
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
        switchTabs(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [trySwitchTab]);

  const submitForm = data => {
    if (data?.abandonDate === "") {
      data.abandonDate = null;
    }
    if (data?.isPrimary === undefined) {
      data.isPrimary = completion.isPrimary;
    }
    saveCompletion({ ...completion, ...data });
  };

  return (
    <>
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(submitForm)}>
          <FormContainer>
            <FormContainer direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
              <FormInput
                fieldName="name"
                label="name"
                required={true}
                value={selectedCompletion?.name}
                sx={{ flex: "1 1 180px" }}
              />
              <FormContainer
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                flex={"0 0 400px"}
                marginRight={"10px"}>
                <FormDomainSelect
                  fieldName="kindId"
                  label="completionKind"
                  selected={selectedCompletion?.kindId}
                  required={true}
                  schemaName={completionSchemaConstants.completionKind}
                  prefilteredDomains={kindOptions}
                />
                <FormCheckbox
                  fieldName="isPrimary"
                  label="mainCompletion"
                  checked={completion.isPrimary}
                  disabled={completion.isPrimary}
                />
              </FormContainer>
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
                sx={{ flex: "0 0 400px" }}
              />
            </FormContainer>
            <SaveAndCancelButtons
              onCancel={() => {
                formMethods.reset(selectedCompletion);
                cancelChanges();
              }}
              onSave={() => {
                formMethods.handleSubmit(submitForm)();
              }}
              saveDisabled={!formMethods.formState.isValid}
            />
          </FormContainer>
        </form>
      </FormProvider>
    </>
  );
};
export default CompletionHeaderInput;
