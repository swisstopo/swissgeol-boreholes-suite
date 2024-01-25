import React, { useEffect } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Box, MenuItem, Stack, Tooltip } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useTranslation } from "react-i18next";
import { useDomains } from "../../../../api/fetchApiV2";
import { completionSchemaConstants } from "./completionSchemaConstants";
import { FormInput, FormSelect } from "../../../../components/form/form";

const BackfillInput = ({
  backfill,
  setSelectedBackfill,
  completionId,
  addBackfill,
  updateBackfill,
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
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(submitForm)}>
        <Stack direction="row" sx={{ width: "100%" }}>
          <Stack direction="column" sx={{ width: "100%" }} spacing={1}>
            <Stack direction="row">
              <FormInput
                fieldName="fromDepth"
                label="fromdepth"
                value={backfill.fromDepth}
                type="number"
                required={true}
              />
              <FormInput
                fieldName="toDepth"
                label="todepth"
                value={backfill.toDepth}
                type="number"
                required={true}
              />
            </Stack>
            <Stack direction="row">
              <FormSelect
                fieldName="kindId"
                label="kindFilling"
                selected={backfill.kindId}
                required={true}>
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
                required={true}>
                {domains?.data
                  ?.filter(
                    d =>
                      d.schema === completionSchemaConstants.backfillMaterial,
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

export default React.memo(BackfillInput);
