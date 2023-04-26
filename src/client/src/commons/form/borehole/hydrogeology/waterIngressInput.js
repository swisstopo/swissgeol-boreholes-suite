import React, { useEffect, useContext, forwardRef } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Card,
  Checkbox,
  FormControlLabel,
  FormControl,
  InputLabel,
  Input,
  MenuItem,
  Select,
  Stack,
  TextField,
  Tooltip,
} from "@mui/material";
import { useDomains } from "../../../../api/fetchApiV2";
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

  // submit values on unmount with useEffect clean up function.
  useEffect(() => {
    return () => {
      handleSubmit(handleFormSubmit)();
    };
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
        addWaterIngress({ ...data, type: 1, boreholeId: boreholeId });
      } else {
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
    overflow: "auto",
  }));

  const TextfieldWithMarginRight = forwardRef((props, ref) => {
    // the ref needs to be manually forwarded with custom components, the native TextField component would handle the forwarding internally.
    const StyledTextField = styled(TextField)(() => ({
      flex: "1",
      marginRight: "10px",
      overflow: "auto",
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
                variant="standard"
                sx={{ flex: "1", marginRight: "10px" }}>
                <InputLabel htmlFor="quantity">{t("quantity")}</InputLabel>
                <Controller
                  name="quantityId"
                  control={control}
                  defaultValue={waterIngress.quantityId}
                  rules={{ required: true }}
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      data-cy="quantity-select"
                      error={Boolean(errors.quantityId)}
                      input={<Input id="quantity" />}
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
                    </Select>
                  )}
                />
              </FormControl>
              <FormControl variant="standard" sx={{ flex: "1" }}>
                <InputLabel htmlFor="conditions">{t("conditions")}</InputLabel>
                <Controller
                  name="conditionsId"
                  control={control}
                  defaultValue={waterIngress.conditionsId}
                  render={({ field }) => (
                    <Select
                      value={field.value || ""}
                      data-cy="conditions-select"
                      input={<Input id="conditions" />}
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
                    </Select>
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
                data-cy="depth-from-m-textfield"
                label={t("fromDepthM")}
                defaultValue={waterIngress.fromDepthM}
                variant="standard"
              />
              <TextfieldNoMargin
                {...register("toDepthM", {
                  valueAsNumber: true,
                })}
                type="number"
                data-cy="depth-to-m-textfield"
                label={t("toDepthM")}
                defaultValue={waterIngress.toDepthM}
                variant="standard"
              />
            </Stack>
            <Stack direction="row">
              <TextfieldWithMarginRight
                {...register("fromDepthMasl", {
                  valueAsNumber: true,
                })}
                type="number"
                data-cy="depth-from-m-textfield"
                label={t("fromDepthMasl")}
                defaultValue={waterIngress.fromDepthMasl}
                variant="standard"
              />
              <TextfieldNoMargin
                {...register("toDepthMasl", {
                  valueAsNumber: true,
                })}
                type="number"
                data-cy="depth-to-masl-textfield"
                label={t("toDepthMasl")}
                defaultValue={waterIngress.toDepthMasl}
                variant="standard"
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
                    variant="standard"
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
                data-cy="end-time-textfield"
                label={t("endTime")}
                defaultValue={formatDateForDatetimeLocal(waterIngress.endTime)}
                variant="standard"
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
            <FormControlLabel
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
            <FormControl variant="standard">
              <InputLabel htmlFor="reliability">{t("reliability")}</InputLabel>
              <Controller
                name="reliabilityId"
                control={control}
                defaultValue={waterIngress.reliabilityId}
                rules={{ required: true }}
                render={({ field }) => (
                  <Select
                    value={field.value || ""}
                    data-cy="reliability-select"
                    error={Boolean(errors.reliabilityId)}
                    input={<Input id="reliability" />}
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
                  </Select>
                )}
              />
            </FormControl>
            <TextfieldNoMargin
              {...register("comment")}
              type="text"
              data-cy="comment-textfield"
              label={t("comment")}
              multiline
              rows={4}
              defaultValue={waterIngress.comment}
              variant="standard"
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
