import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Box, Stack, Tooltip } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useTranslation } from "react-i18next";
import { useDomains } from "../../../../api/fetchApiV2";
import { completionSchemaConstants } from "./completionSchemaConstants";
import { FormInput, FormSelect } from "../../../../components/form/form";

const CasingInput = ({ item, setSelected, parentId, addData, updateData }) => {
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
      setSelected(null);
    }
  };

  const prepareFormDataForSubmit = data => {
    if (data?.dateStart === "") {
      data.dateStart = null;
    }
    if (data?.dateFinish === "") {
      data.dateFinish = null;
    }
    data.completionId = parentId;
    return data;
  };

  const submitForm = data => {
    data = prepareFormDataForSubmit(data);
    if (item.id === 0) {
      addData({
        ...data,
      });
    } else {
      updateData({
        ...item,
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
              label="casingName"
              value={item.name}
              required={true}
            />
            <Stack direction="row">
              <FormInput
                fieldName="fromDepth"
                label="fromdepth"
                value={item.fromDepth}
                type="number"
                required={true}
              />
              <FormInput
                fieldName="toDepth"
                label="todepth"
                value={item.toDepth}
                type="number"
                required={true}
              />
            </Stack>
            <Stack direction="row">
              <FormSelect
                fieldName="kindId"
                label="kindCasingLayer"
                selected={item.kindId}
                required={true}
                values={domains?.data
                  ?.filter(
                    d => d.schema === completionSchemaConstants.casingKind,
                  )
                  .sort((a, b) => a.order - b.order)
                  .map(d => ({
                    key: d.id,
                    name: d[i18n.language],
                  }))}
              />
              <FormSelect
                fieldName="materialId"
                label="materialCasingLayer"
                selected={item.materialId}
                required={true}
                values={domains?.data
                  ?.filter(
                    d => d.schema === completionSchemaConstants.casingMaterial,
                  )
                  .sort((a, b) => a.order - b.order)
                  .map(d => ({
                    key: d.id,
                    name: d[i18n.language],
                  }))}
              />
            </Stack>
            <Stack direction="row">
              <FormInput
                fieldName="dateStart"
                label="dateStartCasing"
                value={item.dateStart}
                type="date"
                required={true}
              />
              <FormInput
                fieldName="dateFinish"
                label="dateFinishCasing"
                value={item.dateFinish}
                type="date"
                required={true}
              />
            </Stack>
            <Stack direction="row">
              <FormInput
                fieldName="innerDiameter"
                label="casing_inner_diameter"
                value={item.innerDiameter}
                type="number"
                required={true}
              />
              <FormInput
                fieldName="outerDiameter"
                label="casing_outer_diameter"
                value={item.outerDiameter}
                type="number"
                required={true}
              />
            </Stack>
            <Stack direction="row">
              <FormInput
                fieldName="notes"
                label="notes"
                multiline={true}
                value={item.notes}
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
