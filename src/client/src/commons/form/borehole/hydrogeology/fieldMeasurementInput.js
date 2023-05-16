import React, { useEffect, useContext } from "react";
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
import { useDomains } from "../../../../api/fetchApiV2";
import CheckIcon from "@mui/icons-material/Check";
import { useTranslation } from "react-i18next";
import { AlertContext } from "../../../alert/alertContext";
import ObservationInput from "./observationInput";
import { ObservationType } from "./observationType";

const FieldMeasurementInput = props => {
  const {
    fieldMeasurement,
    setSelectedFieldMeasurement,
    boreholeId,
    addFieldMeasurement,
    updateFieldMeasurement,
  } = props;
  const domains = useDomains();
  const { t, i18n } = useTranslation();
  const { register, handleSubmit, control, getValues, formState, trigger } =
    useForm();
  const alertContext = useContext(AlertContext);

  // submit values on unmount with useEffect clean up function.
  useEffect(() => {
    return () => {
      handleSubmit(submitForm)();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleSubmit]);

  // trigger form validation on mount
  useEffect(() => {
    trigger();
  }, [trigger]);

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
      if (fieldMeasurement.id === 0) {
        addFieldMeasurement({
          ...data,
          type: ObservationType.fieldMeasurement,
          boreholeId: boreholeId,
        });
      } else {
        delete fieldMeasurement.casing;
        delete fieldMeasurement.sampeType;
        delete fieldMeasurement.parameter;
        delete fieldMeasurement.reliability;
        updateFieldMeasurement({
          ...fieldMeasurement,
          ...data,
        });
      }
    } else {
      setSelectedFieldMeasurement(null);
    }
  };

  const closeFormIfCompleted = () => {
    const formValues = getValues();
    if (
      !formValues.reliabilityId ||
      !formValues.startTime ||
      !formValues.sampleTypeId ||
      !formValues.parameterId ||
      !formValues.value
    ) {
      alertContext.error(t("fieldMeasurementRequiredFieldsAlert"));
    } else {
      setSelectedFieldMeasurement(null);
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
            <ObservationInput
              observation={fieldMeasurement}
              boreholeId={boreholeId}
              register={register}
              control={control}
              formState={formState}
              trigger={trigger}
            />
            <Stack direction="row" sx={{ paddingTop: "10px" }}>
              <FormControl
                variant="outlined"
                sx={{ flex: "1", marginRight: "10px" }}>
                <Controller
                  name="sampleTypeId"
                  control={control}
                  defaultValue={fieldMeasurement.sampleTypeId}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      size="small"
                      label={t("field_measurement_sample_type")}
                      variant="outlined"
                      value={field.value || ""}
                      data-cy="sample-type-select"
                      error={Boolean(formState.errors.sampleTypeId)}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        backgroundColor: getInputFieldBackgroundColor(
                          formState.errors.sampleTypeId,
                        ),
                        borderRadius: "4px",
                      }}
                      onChange={e => {
                        e.stopPropagation();
                        field.onChange(e.target.value);
                        trigger();
                      }}>
                      {domains?.data
                        ?.filter(d => d.schema === "field101")
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
                variant="outlined"
                sx={{ flex: "1", marginRight: "10px" }}>
                <Controller
                  name="parameterId"
                  control={control}
                  defaultValue={fieldMeasurement.parameterId}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      size="small"
                      label={t("parameter")}
                      variant="outlined"
                      value={field.value || ""}
                      data-cy="parameter-select"
                      error={Boolean(formState.errors.parameterId)}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        backgroundColor: getInputFieldBackgroundColor(
                          formState.errors.parameterId,
                        ),
                        borderRadius: "4px",
                      }}
                      onChange={e => {
                        e.stopPropagation();
                        field.onChange(e.target.value);
                        trigger();
                      }}>
                      {domains?.data
                        ?.filter(d => d.schema === "field102")
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
              <TextField
                sx={{
                  flex: "1",
                  marginTop: "10px",
                  marginRight: "10px",
                  backgroundColor: getInputFieldBackgroundColor(
                    formState.errors.value,
                  ),
                  borderRadius: "4px",
                }}
                error={Boolean(formState.errors.value)}
                {...register("value", {
                  valueAsNumber: true,
                  required: true,
                })}
                type="number"
                size="small"
                data-cy="value-textfield"
                label={t("value")}
                defaultValue={fieldMeasurement.value}
                variant="outlined"
                onBlur={() => {
                  trigger("value");
                }}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </Stack>
          <Box sx={{ marginLeft: "auto" }}>
            <Tooltip title={t("close")}>
              <CheckIcon
                sx={{ color: formState.isValid ? "#0080008c" : "disabled" }}
                data-cy="close-icon"
                onClick={() => closeFormIfCompleted()}
              />
            </Tooltip>
          </Box>
        </Stack>
      </form>
    </Card>
  );
};

export default FieldMeasurementInput;
