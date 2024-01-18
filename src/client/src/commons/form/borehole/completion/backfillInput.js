import React, { useEffect } from "react";
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
import { useDomains } from "../../../../api/fetchApiV2";
import { completionSchemaConstants } from "./completionSchemaConstants";
import {
  TextfieldWithMarginRight,
  TextfieldNoMargin,
} from "./styledComponents";

const BackfillInput = ({
  backfill,
  setSelectedBackfill,
  completionId,
  addBackfill,
  updateBackfill,
}) => {
  const domains = useDomains();
  const { t, i18n } = useTranslation();
  const { handleSubmit, register, control, formState, trigger } = useForm();

  // trigger form validation on mount
  useEffect(() => {
    trigger();
  }, [trigger]);

  const closeFormIfCompleted = () => {
    if (formState.isValid) {
      handleSubmit(submitForm)();
      setSelectedBackfill(null);
    }
  };

  const prepareFormDataForSubmit = data => {
    data.completionId = completionId;
    return data;
  };

  const submitForm = data => {
    data = prepareFormDataForSubmit(data);
    if (backfill.id === 0) {
      addBackfill({
        ...data,
      });
    } else {
      updateBackfill({
        ...backfill,
        ...data,
      });
    }
  };

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
                defaultValue={backfill.fromDepth}
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
                defaultValue={backfill.toDepth}
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
            <Stack direction="row" sx={{ paddingTop: "10px" }}>
              <FormControl
                sx={{ flex: "1", marginRight: "10px", marginTop: "10px" }}
                variant="outlined">
                <Controller
                  name="kindId"
                  control={control}
                  defaultValue={backfill.kindId}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      size="small"
                      label={t("kindFilling")}
                      variant="outlined"
                      value={field.value || ""}
                      data-cy="backfill-kind-select"
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
                            d.schema === completionSchemaConstants.backfillKind,
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
                  name="materialId"
                  control={control}
                  defaultValue={backfill.materialId}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      size="small"
                      label={t("materialFilling")}
                      variant="outlined"
                      value={field.value || ""}
                      data-cy="backfill-material-select"
                      error={Boolean(formState.errors.materialId)}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        backgroundColor: Boolean(formState.errors.materialId)
                          ? "#fff6f6"
                          : "transparent",
                        borderRadius: "4px",
                      }}
                      onChange={e => {
                        e.stopPropagation();
                        field.onChange(e.target.value);
                        trigger("materialId");
                      }}>
                      {domains?.data
                        ?.filter(
                          d =>
                            d.schema ===
                            completionSchemaConstants.backfillMaterial,
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
                defaultValue={backfill.notes}
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

export default React.memo(BackfillInput);
