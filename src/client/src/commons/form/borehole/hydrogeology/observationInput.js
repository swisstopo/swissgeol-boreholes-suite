import React, { forwardRef } from "react";
import { Controller } from "react-hook-form";
import {
  Checkbox,
  FormControlLabel,
  FormControl,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { styled } from "@mui/system";
import { useDomains, useCasings } from "../../../../api/fetchApiV2";
import { useTranslation } from "react-i18next";
import { hydrogeologySchemaConstants } from "./hydrogeologySchemaConstants";

const ObservationInput = props => {
  const { observation, boreholeId, register, formState, trigger, control } =
    props;
  const { t, i18n } = useTranslation();
  const domains = useDomains();
  const casings = useCasings(boreholeId);

  // styled components
  const TextfieldNoMargin = forwardRef((props, ref) => {
    // the ref and children needs to be manually forwarded with custom components, the native TextField component would handle the forwarding internally.
    const StyledTextField = styled(TextField)(() => ({
      flex: "1",
      marginTop: "10px",
    }));

    return (
      <StyledTextField ref={ref} {...props}>
        {props.children}
      </StyledTextField>
    );
  });

  const TextfieldWithMarginRight = forwardRef((props, ref) => {
    const StyledTextField = styled(TextField)(() => ({
      flex: "1",
      marginTop: "10px",
      marginRight: "10px",
    }));

    return (
      <StyledTextField ref={ref} {...props}>
        {props.children}
      </StyledTextField>
    );
  });

  const formatDateForDatetimeLocal = date => {
    if (!date) return "";
    // use slice to get from the returned format 'YYYY-MM-DDTHH:mm:ss.sssZ' to the required format for the input 'YYYY-MM-DDTHH:mm'.
    return date.slice(0, 16);
  };

  return (
    <>
      <Stack direction="row">
        <TextfieldWithMarginRight
          {...register("fromDepthM", {
            valueAsNumber: true,
          })}
          type="number"
          size="small"
          data-cy="depth-from-m-textfield"
          label={t("fromdepth")}
          defaultValue={observation.fromDepthM}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
        />
        <TextfieldWithMarginRight
          {...register("toDepthM", {
            valueAsNumber: true,
          })}
          type="number"
          size="small"
          data-cy="depth-to-m-textfield"
          label={t("todepth")}
          defaultValue={observation.toDepthM}
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
          defaultValue={observation.fromDepthMasl}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
        />
        <TextfieldWithMarginRight
          {...register("toDepthMasl", {
            valueAsNumber: true,
          })}
          type="number"
          size="small"
          data-cy="depth-to-masl-textfield"
          label={t("toDepthMasl")}
          defaultValue={observation.toDepthMasl}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
        />
      </Stack>
      <Stack direction="row">
        <TextfieldWithMarginRight
          {...register("startTime", { required: true })}
          type="datetime-local"
          data-cy="start-time-textfield"
          label={t("startTime")}
          variant="outlined"
          size="small"
          error={Boolean(formState.errors.startTime)}
          defaultValue={formatDateForDatetimeLocal(observation.startTime)}
          InputLabelProps={{ shrink: true }}
          sx={{
            backgroundColor: Boolean(formState.errors.startTime)
              ? "#fff6f6"
              : "transparent",
            borderRadius: "4px",
          }}
          onBlur={() => {
            trigger("startTime");
          }}
        />
        <TextfieldWithMarginRight
          {...register("endTime")}
          type="datetime-local"
          size="small"
          data-cy="end-time-textfield"
          label={t("endTime")}
          defaultValue={formatDateForDatetimeLocal(observation.endTime)}
          variant="outlined"
          InputLabelProps={{ shrink: true }}
        />
      </Stack>
      <Stack direction="row">
        <FormControl
          sx={{ flex: "1", marginRight: "10px", marginTop: "10px" }}
          variant="outlined">
          <Controller
            name="reliabilityId"
            control={control}
            defaultValue={observation.reliabilityId}
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
                error={Boolean(formState.errors.reliabilityId)}
                InputLabelProps={{ shrink: true }}
                sx={{
                  backgroundColor: Boolean(formState.errors.reliabilityId)
                    ? "#fff6f6"
                    : "transparent",
                  borderRadius: "4px",
                }}
                onChange={e => {
                  e.stopPropagation();
                  field.onChange(e.target.value);
                  trigger("reliabilityId");
                }}>
                {domains?.data
                  ?.filter(
                    d =>
                      d.schema ===
                      hydrogeologySchemaConstants.observationReliability,
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
        <FormControlLabel
          sx={{
            flex: "1",
          }}
          control={
            <Controller
              name="completionFinished"
              control={control}
              defaultValue={observation.completionFinished || false}
              render={({ field }) => (
                <Checkbox
                  checked={field.value}
                  onChange={e => field.onChange(e.target.checked)}
                />
              )}
            />
          }
          label={t("completionFinished")}
        />
      </Stack>
      <Stack direction="row">
        <FormControl
          variant="outlined"
          sx={{
            flex: "1",
            marginRight: "15px",
            marginTop: "10px",
            marginBottom: "10px",
          }}>
          <Controller
            name="casingId"
            control={control}
            defaultValue={observation.casingId}
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
                }}
                InputLabelProps={{ shrink: true }}>
                <MenuItem key="0" value={null}>
                  <em>{t("reset")}</em>
                </MenuItem>
                {casings?.data?.map(d => (
                  <MenuItem key={d.id} value={d.id}>
                    {d.name || t("np")}
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
        defaultValue={observation.comment}
        variant="outlined"
        sx={{ paddingRight: "10px" }}
        InputLabelProps={{ shrink: true }}
      />
    </>
  );
};

export default ObservationInput;
