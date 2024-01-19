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

const CasingInput = ({
  casing,
  setSelectedCasing,
  completionId,
  addCasing,
  updateCasing,
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
      setSelectedCasing(null);
    }
  };

  const prepareFormDataForSubmit = data => {
    if (data?.dateStart === "") {
      data.dateStart = null;
    }
    if (data?.dateFinish === "") {
      data.dateFinish = null;
    }
    data.completionId = completionId;
    return data;
  };

  const submitForm = data => {
    data = prepareFormDataForSubmit(data);
    if (casing.id === 0) {
      addCasing({
        ...data,
      });
    } else {
      updateCasing({
        ...casing,
        ...data,
      });
    }
  };

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
            <TextfieldWithMarginRight
              {...register("name", {
                required: true,
              })}
              size="small"
              data-cy="name-textfield"
              label={t("casingId")}
              defaultValue={casing.name}
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
                defaultValue={casing.fromDepth}
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
                defaultValue={casing.toDepth}
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
              <FormControl
                sx={{ flex: "1", marginRight: "10px", marginTop: "10px" }}
                variant="outlined">
                <Controller
                  name="kindId"
                  control={control}
                  defaultValue={casing.kindId}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      size="small"
                      label={t("kindCasingLayer")}
                      variant="outlined"
                      value={field.value || ""}
                      data-cy="casing-kind-select"
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
                            d.schema === completionSchemaConstants.casingKind,
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
                  defaultValue={casing.materialId}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      size="small"
                      label={t("materialCasingLayer")}
                      variant="outlined"
                      value={field.value || ""}
                      data-cy="casing-material-select"
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
                            completionSchemaConstants.casingMaterial,
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
              <TextfieldWithMarginRight
                type="date"
                data-cy="casing-dateStart-textfield"
                label={t("dateSpudCasing")}
                variant="outlined"
                size="small"
                error={Boolean(formState.errors.dateStart)}
                {...register("dateStart", {
                  required: true,
                })}
                defaultValue={casing?.dateStart || ""}
                InputLabelProps={{ shrink: true }}
                sx={{
                  backgroundColor: getInputFieldBackgroundColor(
                    formState.errors.dateStart,
                  ),
                  borderRadius: "4px",
                  marginTop: "10px",
                }}
                onBlur={() => {
                  trigger("dateStart");
                }}
              />
              <TextfieldWithMarginRight
                type="date"
                data-cy="casing-dateFinish-textfield"
                label={t("dateFinishCasing")}
                variant="outlined"
                size="small"
                error={Boolean(formState.errors.dateFinish)}
                {...register("dateFinish", {
                  required: true,
                })}
                defaultValue={casing?.dateFinish || ""}
                InputLabelProps={{ shrink: true }}
                sx={{
                  backgroundColor: getInputFieldBackgroundColor(
                    formState.errors.dateFinish,
                  ),
                  borderRadius: "4px",
                  marginTop: "10px",
                }}
                onBlur={() => {
                  trigger("dateFinish");
                }}
              />
            </Stack>
            <Stack direction="row">
              <TextfieldWithMarginRight
                {...register("innerDiameter", {
                  valueAsNumber: true,
                  required: true,
                })}
                type="number"
                size="small"
                data-cy="innerDiameter-textfield"
                label={t("casing_inner_diameter")}
                defaultValue={casing.innerDiameter}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                error={!!formState.errors.innerDiameter}
                sx={{
                  backgroundColor: !!formState.errors.innerDiameter
                    ? "#fff6f6"
                    : "transparent",
                  borderRadius: "4px",
                }}
                onBlur={() => {
                  // trigger but keep focus on the field
                  trigger("innerDiameter", { shouldFocus: true });
                }}
              />
              <TextfieldWithMarginRight
                {...register("outerDiameter", {
                  valueAsNumber: true,
                  required: true,
                })}
                type="number"
                size="small"
                data-cy="outerDiameter-textfield"
                label={t("casing_outer_diameter")}
                defaultValue={casing.outerDiameter}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
                error={!!formState.errors.outerDiameter}
                sx={{
                  backgroundColor: !!formState.errors.outerDiameter
                    ? "#fff6f6"
                    : "transparent",
                  borderRadius: "4px",
                }}
                onBlur={() => {
                  trigger("outerDiameter");
                }}
              />
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
                defaultValue={casing.notes}
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
                  cursor: "pointer",
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

export default React.memo(CasingInput);
