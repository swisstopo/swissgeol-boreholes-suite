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
import { AlertContext } from "../../../../components/alert/alertContext";
import ObservationInput from "./observationInput";
import { ObservationType } from "./observationType";
import { hydrogeologySchemaConstants } from "./hydrogeologySchemaConstants";

const WaterIngressInput = props => {
  const {
    waterIngress,
    setSelectedWaterIngress,
    boreholeId,
    addWaterIngress,
    updateWaterIngress,
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
    if (data.startTime && data.quantityId && data.reliabilityId) {
      if (waterIngress.id === 0) {
        addWaterIngress({
          ...data,
          type: ObservationType.waterIngress,
          boreholeId: boreholeId,
        });
      } else {
        delete waterIngress.casing;
        delete waterIngress.quantity;
        delete waterIngress.reliability;
        updateWaterIngress({ ...waterIngress, ...data });
      }
    } else {
      setSelectedWaterIngress(null);
    }
  };

  const closeFormIfCompleted = () => {
    const formValues = getValues();
    if (
      !formValues.reliabilityId ||
      !formValues.quantityId ||
      !formValues.startTime
    ) {
      alertContext.error(t("waterIngressRequiredFieldsAlert"));
    } else {
      setSelectedWaterIngress(null);
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
              observation={waterIngress}
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
                  name="quantityId"
                  control={control}
                  defaultValue={waterIngress.quantityId}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      size="small"
                      label={t("quantity")}
                      variant="outlined"
                      value={field.value || ""}
                      data-cy="quantity-select"
                      error={Boolean(formState.errors.quantityId)}
                      InputLabelProps={{ shrink: true }}
                      sx={{
                        backgroundColor: Boolean(formState.errors.quantityId)
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
                        ?.filter(
                          d =>
                            d.schema ===
                            hydrogeologySchemaConstants.waterIngressQuantity,
                        )
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
                  name="conditionsId"
                  control={control}
                  defaultValue={waterIngress.conditionsId}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      label={t("conditions")}
                      variant="outlined"
                      size="small"
                      value={field.value || ""}
                      data-cy="conditions-select"
                      InputLabelProps={{ shrink: true }}
                      onChange={e => {
                        e.stopPropagation();
                        field.onChange(e.target.value);
                      }}>
                      <MenuItem key="0" value="">
                        <em>{t("reset")}</em>
                      </MenuItem>
                      {domains?.data
                        ?.filter(
                          d =>
                            d.schema ===
                            hydrogeologySchemaConstants.waterIngressConditions,
                        )
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

export default WaterIngressInput;
