import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Box, MenuItem, Stack, Tooltip } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useTranslation } from "react-i18next";
import { useDomains, getCasings } from "../../../../api/fetchApiV2";
import { completionSchemaConstants } from "./completionSchemaConstants";
import { FormInput, FormSelect } from "../../../../components/form";

const InstrumentationInput = ({
  instrumentation,
  setSelectedInstrumentation,
  completionId,
  addInstrumentation,
  updateInstrumentation,
}) => {
  const domains = useDomains();
  const { t, i18n } = useTranslation();
  const { handleSubmit, register, control, formState, trigger } = useForm({
    mode: "all",
  });
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
    if (data.casingId === "") {
      data.casingId = null;
    }
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

  return (
    <form onSubmit={handleSubmit(submitForm)}>
      <Stack direction="row" sx={{ width: "100%" }}>
        <Stack direction="column" sx={{ width: "100%" }} spacing={1}>
          <Stack direction="row">
            <FormInput
              fieldName="fromDepth"
              label="fromdepth"
              value={instrumentation.fromDepth}
              type="number"
              required={true}
              formState={formState}
              register={register}
              trigger={trigger}
            />
            <FormInput
              fieldName="toDepth"
              label="todepth"
              value={instrumentation.toDepth}
              type="number"
              required={true}
              formState={formState}
              register={register}
              trigger={trigger}
            />
          </Stack>
          <Stack direction="row">
            <FormInput
              fieldName="name"
              label="name"
              value={instrumentation.name}
              required={true}
              formState={formState}
              register={register}
              trigger={trigger}
            />
            <FormSelect
              fieldName="casingId"
              label="casingId"
              selected={instrumentation.casingId}
              formState={formState}
              control={control}
              register={register}
              trigger={trigger}>
              <MenuItem key="0" value={null}>
                <em>{t("reset")}</em>
              </MenuItem>
              {casings?.map(casing => (
                <MenuItem key={casing.id} value={casing.id}>
                  {casing.name}
                </MenuItem>
              ))}
            </FormSelect>
          </Stack>
          <Stack direction="row">
            <FormSelect
              fieldName="kindId"
              label="kindInstrument"
              selected={instrumentation.kindId}
              required={true}
              formState={formState}
              control={control}
              register={register}
              trigger={trigger}>
              {domains?.data
                ?.filter(
                  d =>
                    d.schema === completionSchemaConstants.instrumentationKind,
                )
                .sort((a, b) => a.order - b.order)
                .map(d => (
                  <MenuItem key={d.id} value={d.id}>
                    {d[i18n.language]}
                  </MenuItem>
                ))}
            </FormSelect>
            <FormSelect
              fieldName="statusId"
              label="statusInstrument"
              selected={instrumentation.statusId}
              required={true}
              formState={formState}
              control={control}
              register={register}
              trigger={trigger}>
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
            </FormSelect>
          </Stack>
          <Stack direction="row">
            <FormInput
              fieldName="notes"
              label="notes"
              multiline={true}
              value={instrumentation.notes}
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

export default React.memo(InstrumentationInput);
