import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Box, MenuItem, Stack, Tooltip } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useTranslation } from "react-i18next";
import { useDomains } from "../../../../api/fetchApiV2";
import { completionSchemaConstants } from "./completionSchemaConstants";
import { FormInput, FormSelect } from "../../../../components/form";

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
    <form onSubmit={handleSubmit(submitForm)}>
      <Stack direction="row" sx={{ width: "100%" }}>
        <Stack direction="column" sx={{ width: "100%" }} spacing={1}>
          <Stack direction="row">
            <FormInput
              fieldName="fromDepth"
              label="fromdepth"
              value={backfill.fromDepth}
              type="number"
              required={true}
              formState={formState}
              register={register}
              trigger={trigger}
            />
            <FormInput
              fieldName="toDepth"
              label="todepth"
              value={backfill.toDepth}
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
              label="kindFilling"
              selected={backfill.kindId}
              required={true}
              formState={formState}
              control={control}
              register={register}
              trigger={trigger}>
              {domains?.data
                ?.filter(
                  d => d.schema === completionSchemaConstants.backfillKind,
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
              label="materialFilling"
              selected={backfill.materialId}
              required={true}
              formState={formState}
              control={control}
              register={register}
              trigger={trigger}>
              {domains?.data
                ?.filter(
                  d => d.schema === completionSchemaConstants.backfillMaterial,
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
              value={backfill.notes}
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

export default React.memo(BackfillInput);
