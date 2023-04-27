import React, { useEffect, useContext, forwardRef } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Card,
  Checkbox,
  FormControlLabel,
  FormControl,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import { useDomains, useCasings } from "../../../../api/fetchApiV2";
import ClearIcon from "@mui/icons-material/Clear";
import { useTranslation } from "react-i18next";
import { AlertContext } from "../../../alert/alertContext";
import { styled } from "@mui/system";

const WaterIngressInput = props => {
  const {
    waterIngress,
    setSelectedWaterIngress,
    boreholeId,
    addWaterIngress,
    updateWaterIngress,
  } = props;
  const domains = useDomains();
  const casings = useCasings(boreholeId);
  const { t, i18n } = useTranslation();
  const {
    register,
    handleSubmit,
    control,
    getValues,
    formState: { errors },
    trigger,
  } = useForm();
  const alertContext = useContext(AlertContext);
  const observationType = 1;

  // submit values on unmount with useEffect clean up function.
  useEffect(() => {
    return () => {
      handleSubmit(handleFormSubmit)();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleSubmit]);

  // trigger form validation on mount
  useEffect(() => {
    trigger();
  }, [trigger]);

  const handleFormSubmit = data => {
    //convert dates to IsoStrings
    data?.startTime ? (data.startTime += ":00.000Z") : (data.startTime = null);
    data?.endTime ? (data.endTime += ":00.000Z") : (data.endTime = null);
    if (data.startTime && data.quantityId && data.reliabilityId) {
      if (waterIngress.id === 0) {
        addWaterIngress({
          ...data,
          type: observationType,
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
  const formatDateForDatetimeLocal = date => {
    if (!date) return "";
    // use slice to get from the returned format 'YYYY-MM-DDTHH:mm:ss.sssZ' to the required format for the input 'YYYY-MM-DDTHH:mm'.
    return date.slice(0, 16);
  };

  // styled components
  const TextfieldNoMargin = styled(TextField)(() => ({
    flex: "1",
  }));

  const TextfieldWithMarginRight = forwardRef((props, ref) => {
    // the ref needs to be manually forwarded with custom components, the native TextField component would handle the forwarding internally.
    const StyledTextField = styled(TextField)(() => ({
      flex: "1",
      marginRight: "10px",
    }));

    return <StyledTextField ref={ref} {...props} />;
  });

  return (
    <Card
      sx={{
        border: "1px solid lightgrey",
        borderRadius: "3px",
        p: 1.5,
        mb: 2,
        height: "100%",
      }}>
      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <Stack direction="row" sx={{ width: "100%" }}>
          <Stack direction="column" sx={{ width: "100%" }} spacing={1}>
            <Stack direction="row">
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
                      error={Boolean(errors.quantityId)}
                      onChange={e => {
                        e.stopPropagation();
                        field.onChange(e.target.value);
                        trigger();
                      }}>
                      {domains?.data
                        ?.filter(d => d.schema === "waing101")
                        .map(d => (
                          <MenuItem key={d.id} value={d.id}>
                            {d[i18n.language]}
                          </MenuItem>
                        ))}
                    </TextField>
                  )}
                />
              </FormControl>
              <FormControl variant="outlined" sx={{ flex: "1" }}>
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
                      onChange={e => {
                        e.stopPropagation();
                        field.onChange(e.target.value);
                      }}>
                      <MenuItem key="0" value="">
                        <em>{t("reset")}</em>
                      </MenuItem>
                      {domains?.data
                        ?.filter(d => d.schema === "waing102")
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
              <TextfieldWithMarginRight
                {...register("fromDepthM", {
                  valueAsNumber: true,
                })}
                type="number"
                size="small"
                data-cy="depth-from-m-textfield"
                label={t("fromDepthM")}
                defaultValue={waterIngress.fromDepthM}
                variant="outlined"
              />
              <TextfieldNoMargin
                {...register("toDepthM", {
                  valueAsNumber: true,
                })}
                type="number"
                size="small"
                data-cy="depth-to-m-textfield"
                label={t("toDepthM")}
                defaultValue={waterIngress.toDepthM}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
            <Stack direction="row">
              <TextfieldWithMarginRight
                {...register("fromDepthMasl", {
                  valueAsNumber: true,
                })}
                type="number"
                size="small"
                data-cy="depth-from-m-textfield"
                label={t("fromDepthMasl")}
                defaultValue={waterIngress.fromDepthMasl}
                variant="outlined"
              />
              <TextfieldNoMargin
                {...register("toDepthMasl", {
                  valueAsNumber: true,
                })}
                type="number"
                size="small"
                data-cy="depth-to-masl-textfield"
                label={t("toDepthMasl")}
                defaultValue={waterIngress.toDepthMasl}
                variant="outlined"
              />
            </Stack>
            <Stack direction="row">
              <Controller
                name="startTime"
                control={control}
                defaultValue={formatDateForDatetimeLocal(
                  waterIngress.startTime,
                )}
                rules={{ required: true }}
                render={({ field }) => (
                  <TextfieldWithMarginRight
                    {...field}
                    type="datetime-local"
                    data-cy="start-time-textfield"
                    label={t("startTime")}
                    variant="outlined"
                    size="small"
                    error={Boolean(errors.startTime)}
                    InputLabelProps={{ shrink: true }}
                    onChange={e => {
                      e.stopPropagation();
                      field.onChange(e.target.value);
                      trigger();
                    }}
                  />
                )}
              />
              <TextfieldNoMargin
                {...register("endTime")}
                type="datetime-local"
                size="small"
                data-cy="end-time-textfield"
                label={t("endTime")}
                defaultValue={formatDateForDatetimeLocal(waterIngress.endTime)}
                variant="outlined"
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
            <Stack direction="row">
              <FormControl
                sx={{ flex: "1", marginRight: "10px" }}
                variant="outlined">
                <Controller
                  name="reliabilityId"
                  control={control}
                  defaultValue={waterIngress.reliabilityId}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      size="small"
                      label={t("reliability")}
                      variant="outlined"
                      value={field.value || ""}
                      data-cy="reliability-select"
                      error={Boolean(errors.reliabilityId)}
                      onChange={e => {
                        e.stopPropagation();
                        field.onChange(e.target.value);
                        trigger();
                      }}>
                      {domains?.data
                        ?.filter(d => d.schema === "observ101")
                        .map(d => (
                          <MenuItem key={d.id} value={d.id}>
                            {d[i18n.language]}
                          </MenuItem>
                        ))}
                    </TextField>
                  )}
                />
              </FormControl>
              <FormControlLabel
                sx={{
                  flex: "1",
                }}
                control={
                  <Controller
                    name="completionFinished"
                    control={control}
                    defaultValue={waterIngress.completionFinished || false}
                    render={({ field }) => (
                      <Checkbox
                        checked={field.value}
                        onChange={e => field.onChange(e.target.checked)}
                      />
                    )}
                  />
                }
                label="Ausbau fertiggestellt"
              />
            </Stack>
            <Stack direction="row">
              <FormControl
                variant="outlined"
                sx={{ flex: "1", marginRight: "10px" }}>
                <Controller
                  name="casingId"
                  control={control}
                  defaultValue={waterIngress.casingId}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      size="small"
                      label={t("casing")}
                      variant="outlined"
                      value={field.value || ""}
                      data-cy="casing-select"
                      disabled={!casings?.data?.length}
                      onChange={e => {
                        e.stopPropagation();
                        field.onChange(e.target.value);
                        trigger();
                      }}>
                      <MenuItem key="0" value={null}>
                        <em>{t("reset")}</em>
                      </MenuItem>
                      {casings?.data?.map(d => (
                        <MenuItem key={d.id} value={d.id}>
                          {d.name}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </FormControl>
              <div style={{ flex: "1" }} />
            </Stack>
            <TextfieldNoMargin
              {...register("comment")}
              type="text"
              size="small"
              data-cy="comment-textfield"
              label={t("comment")}
              multiline
              rows={3}
              defaultValue={waterIngress.comment}
              variant="outlined"
            />
          </Stack>
          <Box sx={{ marginLeft: "auto" }}>
            <Tooltip title={t("close")}>
              <ClearIcon
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
