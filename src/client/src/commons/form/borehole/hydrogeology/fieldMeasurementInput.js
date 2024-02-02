import React, { useEffect, useContext } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { Box, InputAdornment, Stack, Tooltip } from "@mui/material";
import { FormInput, FormSelect } from "../../../../components/form/form";
import { useDomains } from "../../../../api/fetchApiV2";
import CheckIcon from "@mui/icons-material/Check";
import { useTranslation } from "react-i18next";
import { AlertContext } from "../../../../components/alert/alertContext";
import ObservationInput from "./observationInput";
import { ObservationType } from "./observationType";
import { hydrogeologySchemaConstants } from "./hydrogeologySchemaConstants";
import { FieldMeasurementParameterUnits } from "./parameterUnits";

const FieldMeasurementInput = props => {
  const { item, setSelected, parentId, addData, updateData } = props;
  const domains = useDomains();
  const { t, i18n } = useTranslation();
  const formMethods = useForm();
  const alertContext = useContext(AlertContext);

  // submit values on unmount with useEffect clean up function.
  useEffect(() => {
    return () => {
      formMethods.handleSubmit(submitForm)();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMethods.handleSubmit]);

  // trigger form validation on mount
  useEffect(() => {
    formMethods.trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMethods.trigger]);

  const submitForm = data => {
    //convert dates to IsoStrings
    data?.startTime ? (data.startTime += ":00.000Z") : (data.startTime = null);
    data?.endTime ? (data.endTime += ":00.000Z") : (data.endTime = null);
    if (
      data.startTime &&
      data.parameterId &&
      data.sampleTypeId &&
      data.value &&
      data.reliabilityId
    ) {
      if (item.id === 0) {
        addData({
          ...data,
          type: ObservationType.fieldMeasurement,
          boreholeId: parentId,
        });
      } else {
        delete item.casing;
        delete item.sampeType;
        delete item.parameter;
        delete item.reliability;
        updateData({
          ...item,
          ...data,
        });
      }
    } else {
      setSelected(null);
    }
  };

  const closeFormIfCompleted = () => {
    const formValues = formMethods.getValues();
    if (
      !formValues.reliabilityId ||
      !formValues.startTime ||
      !formValues.sampleTypeId ||
      !formValues.parameterId ||
      !formValues.value
    ) {
      alertContext.error(t("fieldMeasurementRequiredFieldsAlert"));
    } else {
      setSelected(null);
    }
  };

  const getParameterUnit = parameterId => {
    return FieldMeasurementParameterUnits[
      domains.data?.find(d => d.id === parameterId)?.geolcode
    ];
  };

  const currentParameterId = formMethods.getValues("parameterId");

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(submitForm)}>
        <Stack direction="row" sx={{ width: "100%" }}>
          <Stack direction="column" sx={{ width: "100%" }} spacing={1}>
            <ObservationInput observation={item} boreholeId={parentId} />
            <Stack direction="row" sx={{ paddingTop: "10px" }}>
              <FormSelect
                fieldName="sampleTypeId"
                label="field_measurement_sample_type"
                selected={item.sampleTypeId}
                required={true}
                values={domains?.data
                  ?.filter(
                    d =>
                      d.schema ===
                      hydrogeologySchemaConstants.fieldMeasurementSampleType,
                  )
                  .sort((a, b) => a.order - b.order)
                  .map(d => ({
                    key: d.id,
                    name: d[i18n.language],
                  }))}
              />
              <FormSelect
                fieldName="parameterId"
                label="parameter"
                selected={item.parameterId}
                required={true}
                values={domains?.data
                  ?.filter(
                    d =>
                      d.schema ===
                      hydrogeologySchemaConstants.fieldMeasurementParameter,
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
                fieldName="value"
                label="value"
                value={item.value}
                type="number"
                required={true}
                inputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      {currentParameterId &&
                        getParameterUnit(currentParameterId)}
                    </InputAdornment>
                  ),
                }}
              />
            </Stack>
          </Stack>
          <Box sx={{ marginLeft: "auto" }}>
            <Tooltip title={t("close")}>
              <CheckIcon
                sx={{
                  color: formMethods.formState.isValid
                    ? "#0080008c"
                    : "disabled",
                }}
                data-cy="close-icon"
                onClick={() => closeFormIfCompleted()}
              />
            </Tooltip>
          </Box>
        </Stack>
      </form>
    </FormProvider>
  );
};

export default FieldMeasurementInput;
