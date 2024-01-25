import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Box, MenuItem, Stack, Tooltip } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useTranslation } from "react-i18next";
import { useDomains } from "../../../../api/fetchApiV2";
import { completionSchemaConstants } from "./completionSchemaConstants";
import { FormInput, FormSelect } from "../../../../components/form/form";

const CasingInput = ({
  casing,
  setSelectedCasing,
  completionId,
  addCasing,
  updateCasing,
}) => {
  const domains = useDomains();
  const { t, i18n } = useTranslation();
  const formMethods = useForm({ mode: "all" });

  // trigger form validation on mount
  useEffect(() => {
    formMethods.trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMethods.trigger]);

  const closeFormIfCompleted = () => {
    if (formMethods.formState.isValid) {
      formMethods.handleSubmit(submitForm)();
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

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(submitForm)}>
        <Stack direction="row" sx={{ width: "100%" }}>
          <Stack direction="column" sx={{ width: "100%" }} spacing={1}>
            <FormInput
              fieldName="name"
              label="casingId"
              value={casing.name}
              required={true}
            />
            <Stack direction="row">
              <FormInput
                fieldName="fromDepth"
                label="fromdepth"
                value={casing.fromDepth}
                type="number"
                required={true}
              />
              <FormInput
                fieldName="toDepth"
                label="todepth"
                value={casing.toDepth}
                type="number"
                required={true}
              />
            </Stack>
            <Stack direction="row">
              <FormSelect
                fieldName="kindId"
                label="kindCasingLayer"
                selected={casing.kindId}
                required={true}>
                {domains?.data
                  ?.filter(
                    d => d.schema === completionSchemaConstants.casingKind,
                  )
                  .sort((a, b) => a.order - b.order)
                  .map(d => (
                    <MenuItem key={d.id} value={d.id}>
                      {d[i18n.language]}
                    </MenuItem>
                  ))}
              </FormSelect>
              <FormSelect
                fieldName="materialId"
                label="materialCasingLayer"
                selected={casing.materialId}
                required={true}>
                {domains?.data
                  ?.filter(
                    d => d.schema === completionSchemaConstants.casingMaterial,
                  )
                  .sort((a, b) => a.order - b.order)
                  .map(d => (
                    <MenuItem key={d.id} value={d.id}>
                      {d[i18n.language]}
                    </MenuItem>
                  ))}
              </FormSelect>
            </Stack>
            <Stack direction="row">
              <FormInput
                fieldName="dateStart"
                label="dateSpudCasing"
                value={casing.dateStart}
                type="date"
                required={true}
              />
              <FormInput
                fieldName="dateFinish"
                label="dateFinishCasing"
                value={casing.dateFinish}
                type="date"
                required={true}
              />
            </Stack>
            <Stack direction="row">
              <FormInput
                fieldName="innerDiameter"
                label="casing_inner_diameter"
                value={casing.innerDiameter}
                type="number"
                required={true}
              />
              <FormInput
                fieldName="outerDiameter"
                label="casing_outer_diameter"
                value={casing.outerDiameter}
                type="number"
                required={true}
              />
            </Stack>
            <Stack direction="row">
              <FormInput
                fieldName="notes"
                label="notes"
                multiline={true}
                value={casing.notes}
              />
            </Stack>
          </Stack>
          <Box sx={{ marginLeft: "auto" }}>
            <Tooltip title={t("save")}>
              <CheckIcon
                sx={{
                  color: formMethods.formState.isValid
                    ? "#0080008c"
                    : "disabled",
                  cursor: "pointer",
                }}
                data-cy="save-icon"
                onClick={() => closeFormIfCompleted()}
              />
            </Tooltip>
          </Box>
        </Stack>
      </form>
    </FormProvider>
  );
};

export default React.memo(CasingInput);
