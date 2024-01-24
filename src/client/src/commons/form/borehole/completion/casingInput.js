import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Box, MenuItem, Stack, Tooltip } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useTranslation } from "react-i18next";
import { useDomains } from "../../../../api/fetchApiV2";
import { completionSchemaConstants } from "./completionSchemaConstants";
import { FormInput, FormSelect } from "../../../../components/form";

const CasingInput = ({
  casing,
  setSelectedCasing,
  completionId,
  addCasing,
  updateCasing,
}) => {
  const domains = useDomains();
  const { t, i18n } = useTranslation();
  const { handleSubmit, register, control, formState, trigger } = useForm({
    mode: "all",
  });

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

  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <Stack direction="row" sx={{ width: "100%" }}>
        <Stack direction="column" sx={{ width: "100%" }} spacing={1}>
          <FormInput
            fieldName="name"
            label="casingId"
            value={casing.name}
            required={true}
            formState={formState}
            register={register}
            trigger={trigger}
          />
          <Stack direction="row">
            <FormInput
              fieldName="fromDepth"
              label="fromdepth"
              value={casing.fromDepth}
              type="number"
              required={true}
              formState={formState}
              register={register}
              trigger={trigger}
            />
            <FormInput
              fieldName="toDepth"
              label="todepth"
              value={casing.toDepth}
              type="number"
              required={true}
              formState={formState}
              register={register}
              trigger={trigger}
            />
          </Stack>
          <Stack direction="row">
            <FormSelect
              fieldName="kindId"
              label="kindCasingLayer"
              selected={casing.kindId}
              required={true}
              formState={formState}
              control={control}
              register={register}
              trigger={trigger}>
              {domains?.data
                ?.filter(d => d.schema === completionSchemaConstants.casingKind)
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
              required={true}
              formState={formState}
              control={control}
              register={register}
              trigger={trigger}>
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
              formState={formState}
              register={register}
              trigger={trigger}
            />
            <FormInput
              fieldName="dateFinish"
              label="dateFinishCasing"
              value={casing.dateFinish}
              type="date"
              required={true}
              formState={formState}
              register={register}
              trigger={trigger}
            />
          </Stack>
          <Stack direction="row">
            <FormInput
              fieldName="innerDiameter"
              label="casing_inner_diameter"
              value={casing.innerDiameter}
              type="number"
              required={true}
              formState={formState}
              register={register}
              trigger={trigger}
            />
            <FormInput
              fieldName="outerDiameter"
              label="casing_outer_diameter"
              value={casing.outerDiameter}
              type="number"
              required={true}
              formState={formState}
              register={register}
              trigger={trigger}
            />
          </Stack>
          <Stack direction="row">
            <FormInput
              fieldName="notes"
              label="notes"
              multiline={true}
              value={casing.notes}
              formState={formState}
              register={register}
              trigger={trigger}
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
  );
};

export default React.memo(CasingInput);
