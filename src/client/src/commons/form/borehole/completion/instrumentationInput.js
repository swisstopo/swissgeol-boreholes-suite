import React, { useEffect, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Box, Stack, Tooltip } from "@mui/material";
import CheckIcon from "@mui/icons-material/Check";
import { useTranslation } from "react-i18next";
import { useDomains, getCasings } from "../../../../api/fetchApiV2";
import { completionSchemaConstants } from "./completionSchemaConstants";
import { FormInput, FormSelect } from "../../../../components/form/form";

const InstrumentationInput = ({
  item,
  setSelected,
  parentId,
  addData,
  updateData,
}) => {
  const domains = useDomains();
  const { t, i18n } = useTranslation();
  const formMethods = useForm({ mode: "all" });

  const [casings, setCasings] = useState([]);

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
    if (data.casingId === "") {
      data.casingId = null;
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

  useEffect(() => {
    if (parentId) {
      getCasings(parentId).then(casings => {
        setCasings(casings);
      });
    }
  }, [parentId]);

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(submitForm)}>
        <Stack direction="row" sx={{ width: "100%" }}>
          <Stack direction="column" sx={{ width: "100%" }} spacing={1}>
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
              <FormInput
                fieldName="name"
                label="name"
                value={item.name}
                required={true}
              />
              <FormSelect
                fieldName="casingId"
                label="casingName"
                selected={item.casingId}
                values={casings?.map(casing => ({
                  key: casing.id,
                  name: casing.name,
                }))}
              />
            </Stack>
            <Stack direction="row">
              <FormSelect
                fieldName="kindId"
                label="kindInstrument"
                selected={item.kindId}
                required={true}
                values={domains?.data
                  ?.filter(
                    d =>
                      d.schema ===
                      completionSchemaConstants.instrumentationKind,
                  )
                  .sort((a, b) => a.order - b.order)
                  .map(d => ({
                    key: d.id,
                    name: d[i18n.language],
                  }))}
              />
              <FormSelect
                fieldName="statusId"
                label="statusInstrument"
                selected={item.statusId}
                required={true}
                values={domains?.data
                  ?.filter(
                    d =>
                      d.schema ===
                      completionSchemaConstants.instrumentationStatus,
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

export default React.memo(InstrumentationInput);
