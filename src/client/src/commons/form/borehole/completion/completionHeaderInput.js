import React, { useState, useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Stack } from "@mui/material";
import CancelIcon from "@mui/icons-material/Cancel";
import SaveIcon from "@mui/icons-material/Save";
import { useDomains } from "../../../../api/fetchApiV2";
import { completionSchemaConstants } from "./completionSchemaConstants";
import { BdmsIconButton } from "../../../../components/buttons/buttons";
import {
  FormInput,
  FormSelect,
  FormCheckbox,
} from "../../../../components/form/form";
import Prompt from "../../../../components/prompt/prompt";

const CompletionHeaderInput = props => {
  const {
    completion,
    cancelChanges,
    saveCompletion,
    trySwitchTab,
    switchTabs,
  } = props;
  const domains = useDomains();
  const formMethods = useForm({ mode: "all" });
  const { i18n } = useTranslation();

  const [selectedCompletion, setSelectedCompletion] = useState({
    ...completion,
  });
  const [showSavePrompt, setShowSavePrompt] = useState(false);

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
        setShowSavePrompt(true);
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
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              flexWrap="wrap">
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
                    ?.filter(
                      d =>
                        d.schema === completionSchemaConstants.completionKind,
                    )
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
            <Stack
              direction="row"
              justifyContent="space-between"
              flexWrap="wrap">
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
            <Stack
              direction="row"
              sx={{ marginLeft: "auto", paddingTop: "5px" }}>
              <BdmsIconButton
                icon={<CancelIcon />}
                tooltipLabel={"cancel"}
                onClick={e => {
                  e.stopPropagation();
                  formMethods.reset(selectedCompletion);
                  cancelChanges();
                }}
              />
              <BdmsIconButton
                icon={<SaveIcon />}
                tooltipLabel={"save"}
                disabled={!formMethods.formState.isValid}
                onClick={e => {
                  e.stopPropagation();
                  formMethods.handleSubmit(submitForm)();
                }}
              />
            </Stack>
          </Stack>
        </form>
      </FormProvider>
      <Prompt
        open={showSavePrompt}
        setOpen={setShowSavePrompt}
        titleLabel="unsavedChangesTitle"
        messageLabel="unsavedChangesMessage"
        actions={[
          {
            label: "cancel",
            action: () => {
              switchTabs(false);
            },
          },
          {
            label: "reset",
            action: () => {
              formMethods.reset(selectedCompletion);
              switchTabs(true);
            },
          },
          {
            label: "save",
            disabled: !formMethods.formState.isValid,
            action: () => {
              formMethods.handleSubmit(submitForm)();
            },
          },
        ]}
      />
    </>
  );
};
export default CompletionHeaderInput;
