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

const GroundwaterLevelMeasurementInput = props => {
  const {
    groundwaterLevelMeasurement,
    setSelectedGroundwaterLevelMeasurement,
    boreholeId,
    addGroundwaterLevelMeasurement,
    updateGroundwaterLevelMeasurement,
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
    if (data.startTime && data.kindId && data.reliabilityId) {
      if (groundwaterLevelMeasurement.id === 0) {
        addGroundwaterLevelMeasurement({
          ...data,
          type: ObservationType.groundwaterLevelMeasurement,
          boreholeId: boreholeId,
        });
      } else {
        delete groundwaterLevelMeasurement.casing;
        delete groundwaterLevelMeasurement.kind;
        delete groundwaterLevelMeasurement.reliability;
        updateGroundwaterLevelMeasurement({
          ...groundwaterLevelMeasurement,
          ...data,
        });
      }
    } else {
      setSelectedGroundwaterLevelMeasurement(null);
    }
  };

  const closeFormIfCompleted = () => {
    const formValues = getValues();
    if (
      !formValues.reliabilityId ||
      !formValues.kindId ||
      !formValues.startTime
    ) {
      alertContext.error(t("gwlmRequiredFieldsAlert"));
    } else {
      setSelectedGroundwaterLevelMeasurement(null);
    }
  };

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
              observation={groundwaterLevelMeasurement}
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
                  name="kindId"
                  control={control}
                  defaultValue={groundwaterLevelMeasurement.kindId}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      size="small"
                      label={t("gwlm_kind")}
                      variant="outlined"
                      value={field.value || ""}
                      data-cy="kind-select"
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
                        trigger();
                      }}>
                      {domains?.data
                        ?.filter(d => d.schema === "gwlme101")
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
                sx={{ flex: "1", marginTop: "10px", marginRight: "10px" }}
                {...register("levelM", {
                  valueAsNumber: true,
                })}
                type="number"
                size="small"
                data-cy="level-m-textfield"
                label={t("gwlm_levelm")}
                defaultValue={groundwaterLevelMeasurement.levelM}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
              <TextField
                sx={{ flex: "1", marginTop: "10px", marginRight: "10px" }}
                {...register("levelMasl", {
                  valueAsNumber: true,
                })}
                type="number"
                size="small"
                data-cy="level-masl-textfield"
                label={t("gwlm_levelmasl")}
                defaultValue={groundwaterLevelMeasurement.levelMasl}
                variant="outlined"
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

export default GroundwaterLevelMeasurementInput;
