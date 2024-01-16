import React, { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import {
  Stack,
  FormControl,
  TextField,
  MenuItem,
  Checkbox,
  Tooltip,
  FormControlLabel,
} from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import SaveIcon from "@mui/icons-material/Save";
import { useDomains } from "../../../../api/fetchApiV2";
import { IconButtonWithMargin } from "./styledComponents";
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
    if (newlySelectedTab) {
      if (isDirty()) {
        setShowSavePrompt(true);
      } else {
        switchTabs(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [newlySelectedTab]);

  const isDirty = () => {
    const values = getValues();
    if (values.abandonDate === "") {
      values.abandonDate = null;
    }
    var dirty = !(
      values.name === completion.name &&
      values.kindId === completion.kindId &&
      values.abandonDate === completion.abandonDate &&
      values.notes === completion.notes &&
      values.isPrimary === completion.isPrimary
    );
    console.log("isDirty: " + dirty);
    return dirty;
  };

  const submitForm = data => {
    data?.abandonDate
      ? (data.abandonDate += ":00.000Z")
      : (data.abandonDate = null);
    saveCompletion({ ...completion, ...data });
  };

  const getInputFieldBackgroundColor = errorFieldName =>
    Boolean(errorFieldName) ? "#fff6f6" : "transparent";

  const formatDateForDatetimeLocal = date => {
    if (!date) return null;
    // use slice to get from the returned format 'YYYY-MM-DDTHH:mm:ss.sssZ' to the required format for the input 'YYYY-MM-DDTHH:mm'.
    return date.slice(0, 16);
  };

  return (
    <>
      <form onSubmit={handleSubmit(submitForm)}>
        <Stack direction="column">
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center">
            <TextField
              name="name"
              sx={{
                flex: "1",
                marginTop: "10px",
                marginRight: "10px",
                backgroundColor: getInputFieldBackgroundColor(
                  formState.errors.name,
                ),
                borderRadius: "4px",
              }}
              type="text"
              size="small"
              label={t("name")}
              variant="outlined"
              error={Boolean(formState.errors.name)}
              {...register("name", {
                required: true,
              })}
              defaultValue={selectedCompletion?.name || ""}
              data-cy="completion-name-textfield"
              InputLabelProps={{ shrink: true }}
              onChange={() => {
                trigger("name");
              }}
            />
            <FormControl
              variant="outlined"
              sx={{ flex: "1", marginRight: "10px" }}
              required>
              <Controller
                name="kindId"
                control={control}
                defaultValue={selectedCompletion?.kindId}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    size="small"
                    label={t("completionKind")}
                    variant="outlined"
                    value={field.value || ""}
                    data-cy="completion-kind-id-select"
                    error={Boolean(formState.errors.kindId)}
                    {...register("kindId", {
                      required: true,
                    })}
                    InputLabelProps={{ shrink: true }}
                    sx={{
                      backgroundColor: getInputFieldBackgroundColor(
                        formState.errors.kindId,
                      ),
                      borderRadius: "4px",
                      marginTop: "10px",
                    }}
                    onChange={e => {
                      e.stopPropagation();
                      field.onChange(e.target.value);
                      trigger("kindId");
                    }}>
                    <MenuItem key="0" value={null}>
                      <em>{t("reset")}</em>
                    </MenuItem>
                    {domains?.data
                      ?.filter(d => d.schema === "completion_kind")
                      .sort((a, b) => a.order - b.order)
                      .map(d => (
                        <MenuItem key={d.id} value={d.id}>
                          {d[i18n.language]}
                        </MenuItem>
                      ))}
                  </TextField>
                )}
              />
            </FormControl>
          </Stack>
          <TextField
            type="datetime-local"
            data-cy="abandon-date-textfield"
            label={t("dateAbandonmentCasing")}
            variant="outlined"
            size="small"
            error={Boolean(formState.errors.abandonDate)}
            {...register("abandonDate")}
            defaultValue={formatDateForDatetimeLocal(
              selectedCompletion?.abandonDate,
            )}
            InputLabelProps={{ shrink: true }}
            sx={{
              backgroundColor: getInputFieldBackgroundColor(
                formState.errors.abandonDate,
              ),
              borderRadius: "4px",
              marginTop: "10px",
              marginRight: "10px",
            }}
            onChange={() => {
              trigger("abandonDate");
            }}
          />
          <TextField
            sx={{
              flex: "1",
              marginTop: "10px",
              marginRight: "10px",
              backgroundColor: getInputFieldBackgroundColor(
                formState.errors.notes,
              ),
              borderRadius: "4px",
            }}
            error={Boolean(formState.errors.notes)}
            {...register("notes")}
            type="text"
            size="small"
            label={t("notes")}
            variant="outlined"
            multiline
            defaultValue={selectedCompletion?.notes || ""}
            data-cy="completion-notes-textfield"
            InputLabelProps={{ shrink: true }}
            onChange={() => {
              trigger("notes");
            }}
          />
          <FormControlLabel
            control={
              <Checkbox
                {...register("isPrimary")}
                disabled={completion.isPrimary}
                defaultChecked={completion.isPrimary}
                onChange={() => {
                  trigger("isPrimary");
                }}
              />
            }
            label={t("mainCompletion")}
          />
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
              cancelChanges();
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
