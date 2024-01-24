import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Stack, MenuItem, Tooltip } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { useDomains } from "../../../../api/fetchApiV2";
import { IconButtonWithMargin } from "./styledComponents";
import {
  FormInput,
  FormSelect,
  FormCheckbox,
} from "../../../../components/form";
import Prompt from "../../../prompt/prompt";

const CompletionHeaderInput = props => {
  const {
    completion,
    cancelChanges,
    saveCompletion,
    newlySelectedTab,
    switchTabs,
  } = props;
  const domains = useDomains();
  const {
    register,
    handleSubmit,
    control,
    formState,
    getValues,
    trigger,
    reset,
  } = useForm();
  const { t, i18n } = useTranslation();

  const [selectedCompletion, setSelectedCompletion] = useState({
    ...completion,
  });
  const [showSavePrompt, setShowSavePrompt] = useState(false);

  // trigger form validation on mount
  useEffect(() => {
    trigger();
  }, [trigger]);

  useEffect(() => {
    setSelectedCompletion(completion);
  }, [completion]);

  useEffect(() => {
    if (newlySelectedTab !== null) {
      if (isDirty()) {
        setShowSavePrompt(true);
      } else {
        switchTabs(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newlySelectedTab]);

  const equals = (a, b) => {
    return a === b || (a === "" && b === null);
  };

  const isDirty = () => {
    const values = getValues();
    var dirty = !(
      equals(values.name, completion.name) &&
      equals(values.kindId, completion.kindId) &&
      equals(values.abandonDate, completion.abandonDate) &&
      equals(values.notes, completion.notes) &&
      (completion.isPrimary || values.isPrimary === completion.isPrimary)
    );
    return dirty;
  };

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
      <form onSubmit={handleSubmit(submitForm)}>
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
              formState={formState}
              register={register}
              trigger={trigger}
              sx={{ flex: "1 1 180px" }}
            />
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              flex={"0 0 400px"}>
              <FormSelect
                fieldName="kindId"
                label="completionKind"
                selected={selectedCompletion?.kindId}
                required={true}
                formState={formState}
                control={control}
                register={register}
                trigger={trigger}
                sx={{ marginRight: "0" }}>
                {domains?.data
                  ?.filter(d => d.schema === "completion_kind")
                  .sort((a, b) => a.order - b.order)
                  .map(d => (
                    <MenuItem key={d.id} value={d.id}>
                      {d[i18n.language]}
                    </MenuItem>
                  ))}
              </FormSelect>
              <FormCheckbox
                fieldName="isPrimary"
                label="mainCompletion"
                checked={completion.isPrimary}
                disabled={completion.isPrimary}
                register={register}
                trigger={trigger}
                sx={{ marginRight: "0" }}
              />
            </Stack>
          </Stack>
          <Stack direction="row" justifyContent="space-between" flexWrap="wrap">
            <FormInput
              fieldName="notes"
              label="notes"
              multiline={true}
              rows={1}
              value={selectedCompletion?.notes}
              formState={formState}
              register={register}
              trigger={trigger}
              sx={{ flex: "1 1 180px" }}
            />
            <FormInput
              fieldName="abandonDate"
              label="dateAbandonmentCasing"
              type="date"
              value={selectedCompletion?.abandonDate}
              formState={formState}
              register={register}
              trigger={trigger}
              sx={{ marginRight: "0", flex: "0 0 400px" }}
            />
          </Stack>
          <Stack direction="row" sx={{ marginLeft: "auto", paddingTop: "5px" }}>
            <Tooltip title={t("cancel")}>
              <IconButtonWithMargin
                data-cy="cancel-button"
                onClick={e => {
                  e.stopPropagation();
                  reset(selectedCompletion);
                  cancelChanges();
                }}>
                <CloseIcon />
              </IconButtonWithMargin>
            </Tooltip>
            <Tooltip title={t("save")}>
              <span>
                <IconButtonWithMargin
                  disabled={!formState.isValid}
                  data-cy="save-button"
                  onClick={e => {
                    e.stopPropagation();
                    handleSubmit(submitForm)();
                  }}>
                  <SaveIcon />
                </IconButtonWithMargin>
              </span>
            </Tooltip>
          </Stack>
        </Stack>
      </form>
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
              reset(selectedCompletion);
              switchTabs(true);
            },
          },
          {
            label: "save",
            action: () => {
              handleSubmit(submitForm)();
            },
          },
        ]}
      />
    </>
  );
};
export default CompletionHeaderInput;
