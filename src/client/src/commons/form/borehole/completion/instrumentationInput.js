import React, { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Card,
  FormControl,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useTranslation } from "react-i18next";
import { useDomains, getCasings } from "../../../../api/fetchApiV2";
import { completionSchemaConstants } from "./completionSchemaConstants";
import {
  TextfieldWithMarginRight,
  TextfieldNoMargin,
} from "./styledComponents";

const InstrumentationInput = ({
  instrumentation,
  setSelectedInstrumentation,
  completionId,
  addInstrumentation,
  updateInstrumentation,
}) => {
  const domains = useDomains();
  const { t, i18n } = useTranslation();
  const { handleSubmit, register, control, formState, trigger } = useForm();
  const [casings, setCasings] = useState([]);

  // trigger form validation on mount
  useEffect(() => {
    trigger();
  }, [trigger]);

  const closeFormIfCompleted = () => {
    if (formState.isValid) {
      handleSubmit(submitForm)();
      setSelectedInstrumentation(null);
    }
  };

  const prepareFormDataForSubmit = data => {
    data.completionId = completionId;
    return data;
  };

  const submitForm = data => {
    data = prepareFormDataForSubmit(data);
    if (instrumentation.id === 0) {
      addInstrumentation({
        ...data,
      });
    } else {
      updateInstrumentation({
        ...instrumentation,
        ...data,
      });
    }
  };

  useEffect(() => {
    if (completionId) {
      getCasings(completionId).then(casings => {
        setCasings(casings);
      });
    }
  }, [completionId]);

  const getInputFieldBackgroundColor = errorFieldName =>
    Boolean(errorFieldName) ? "#fff6f6" : "transparent";

  return (
    <Card
      sx={{
        border: "1px solid lightgrey",
        borderRadius: "3px",
        p: 1.5,
        mb: 2,
        height: "100%",
      }}>
      <form onSubmit={handleSubmit(submitForm)}>
        <Stack direction="row" sx={{ width: "100%" }}>
          <Stack direction="column" sx={{ width: "100%" }} spacing={1}>
            <Stack direction="row">
              <TextfieldWithMarginRight
                {...register("fromDepth", {
                  valueAsNumber: true,
                  required: true,
                })}
                type="number"
                size="small"
                data-cy="from-depth-m-textfield"
                label={t("fromdepth")}
                defaultValue={instrumentation.fromDepth}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                error={!!formState.errors.fromDepth}
                sx={{
                  backgroundColor: !!formState.errors.fromDepth
                    ? "#fff6f6"
                    : "transparent",
                  borderRadius: "4px",
                }}
                onBlur={() => {
                  // trigger but keep focus on the field
                  trigger("fromDepth", { shouldFocus: true });
                }}
              />
              <TextfieldWithMarginRight
                {...register("toDepth", {
                  valueAsNumber: true,
                  required: true,
                })}
                type="number"
                size="small"
                data-cy="to-depth-m-textfield"
                label={t("todepth")}
                defaultValue={instrumentation.toDepth}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                error={!!formState.errors.toDepth}
                sx={{
                  backgroundColor: !!formState.errors.toDepth
                    ? "#fff6f6"
                    : "transparent",
                  borderRadius: "4px",
                }}
                onBlur={() => {
                  trigger("toDepth");
                }}
              />
            </Stack>
            <Stack direction="row">
              <TextfieldWithMarginRight
                {...register("name", { required: true })}
                type="text"
                size="small"
                data-cy="name-textfield"
                label={t("name")}
                defaultValue={instrumentation.name}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                error={!!formState.errors.name}
                sx={{
                  backgroundColor: !!formState.errors.name
                    ? "#fff6f6"
                    : "transparent",
                  borderRadius: "4px",
                }}
                onBlur={() => {
                  trigger("name");
                }}
              />
              <FormControl
                variant="outlined"
                sx={{ marginRight: "10px", flex: "1" }}>
                <Controller
                  name="casingId"
                  control={control}
                  defaultValue={instrumentation?.casingId}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      size="small"
                      label={t("casingId")}
                      variant="outlined"
                      value={field.value || ""}
                      data-cy="completion-casing-id-select"
                      error={Boolean(formState.errors.casingId)}
                      {...register("casingId")}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        backgroundColor: getInputFieldBackgroundColor(
                          formState.errors.casingId,
                        ),
                        borderRadius: "4px",
                        marginTop: "10px",
                        flex: "1 1 auto",
                      }}
                      onChange={e => {
                        e.stopPropagation();
                        field.onChange(e.target.value);
                        trigger("casingId");
                      }}>
                      <MenuItem key="0" value={null}>
                        <em>{t("reset")}</em>
                      </MenuItem>
                      {casings?.map(casing => (
                        <MenuItem key={casing.id} value={casing.id}>
                          {casing.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </FormControl>
            </Stack>
            <Stack direction="row" sx={{ paddingTop: "10px" }}>
              <FormControl
                sx={{ flex: "1", marginRight: "10px", marginTop: "10px" }}
                variant="outlined">
                <Controller
                  name="kindId"
                  control={control}
                  defaultValue={instrumentation.kindId}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      size="small"
                      label={t("kindInstrument")}
                      variant="outlined"
                      value={field.value || ""}
                      data-cy="instrumentation-kind-select"
                      error={Boolean(formState.errors.kindId)}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        backgroundColor: Boolean(formState.errors.kindId)
                          ? "#fff6f6"
                          : "transparent",
                        borderRadius: "4px",
                      }}
                      onChange={e => {
                        e.stopPropagation();
                        field.onChange(e.target.value);
                        trigger("kindId");
                      }}>
                      {domains?.data
                        ?.filter(
                          d =>
                            d.schema ===
                            completionSchemaConstants.instrumentationKind,
                        )
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
              <FormControl
                sx={{ flex: "1", marginRight: "10px", marginTop: "10px" }}
                variant="outlined">
                <Controller
                  name="statusId"
                  control={control}
                  defaultValue={instrumentation.statusId}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      size="small"
                      label={t("statusInstrument")}
                      variant="outlined"
                      value={field.value || ""}
                      data-cy="instrumentation-status-select"
                      error={Boolean(formState.errors.statusId)}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        backgroundColor: Boolean(formState.errors.statusId)
                          ? "#fff6f6"
                          : "transparent",
                        borderRadius: "4px",
                      }}
                      onChange={e => {
                        e.stopPropagation();
                        field.onChange(e.target.value);
                        trigger("statusId");
                      }}>
                      {domains?.data
                        ?.filter(
                          d =>
                            d.schema ===
                            completionSchemaConstants.instrumentationStatus,
                        )
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
            <Stack direction="row">
              <TextfieldNoMargin
                {...register("notes")}
                type="text"
                size="small"
                data-cy="notes-textfield"
                label={t("notes")}
                multiline
                rows={3}
                defaultValue={instrumentation.notes}
                variant="outlined"
                sx={{ paddingRight: "10px" }}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Stack>
          <Box sx={{ marginLeft: "auto" }}>
            <Tooltip title={t("save")}>
              <CheckIcon
                sx={{
                  color: formState.isValid ? "#0080008c" : "disabled",
                }}
                data-cy="save-icon"
                onClick={() => closeFormIfCompleted()}
              />
            </Tooltip>
          </Box>
        </Stack>
      </form>
    </Card>
  );
};

export default React.memo(InstrumentationInput);
