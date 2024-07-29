import { useContext, useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Stack } from "@mui/material";
import { useDomains } from "../../../../api/fetchApiV2";
import { completionSchemaConstants } from "./completionSchemaConstants";
import { DataCardButtonContainer } from "../../../../components/dataCard/dataCard";
import { FormCheckbox, FormInput, FormSelect } from "../../../../components/form/form";
import { CancelButton, SaveButton } from "../../../../components/buttons/buttons.tsx";
import { PromptContext } from "../../../../components/prompt/promptContext.tsx";

const CompletionHeaderInput = props => {
  const { completion, cancelChanges, saveCompletion, trySwitchTab, switchTabs } = props;
  const { showPrompt } = useContext(PromptContext);
  const domains = useDomains();
  const formMethods = useForm({ mode: "all" });
  const { t, i18n } = useTranslation();

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
          <Stack direction="column">
            <Stack direction="row" justifyContent="space-between" alignItems="center" flexWrap="wrap">
              <FormInput
                fieldName="name"
                label="name"
                required={true}
                value={selectedCompletion?.name}
                sx={{ flex: "1 1 180px" }}
              />
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                flex={"0 0 400px"}
                marginRight={"10px"}>
                <FormSelect
                  fieldName="kindId"
                  label="completionKind"
                  selected={selectedCompletion?.kindId}
                  required={true}
                  values={domains?.data
                    ?.filter(d => d.schema === completionSchemaConstants.completionKind)
                    .sort((a, b) => a.order - b.order)
                    .map(d => ({
                      key: d.id,
                      name: d[i18n.language],
                    }))}
                />
                <FormCheckbox
                  fieldName="isPrimary"
                  label="mainCompletion"
                  checked={completion.isPrimary}
                  disabled={completion.isPrimary}
                />
              </Stack>
            </Stack>
            <Stack direction="row" justifyContent="space-between" flexWrap="wrap">
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
                type="date"
                value={selectedCompletion?.abandonDate}
                sx={{ flex: "0 0 400px" }}
              />
            </Stack>
            <DataCardButtonContainer>
              <CancelButton
                onClick={() => {
                  formMethods.reset(selectedCompletion);
                  cancelChanges();
                }}
              />
              <SaveButton
                disabled={!formMethods.formState.isValid}
                onClick={() => {
                  formMethods.handleSubmit(submitForm)();
                }}
              />
            </DataCardButtonContainer>
          </Stack>
        </form>
      </FormProvider>
    </>
  );
};
export default CompletionHeaderInput;
