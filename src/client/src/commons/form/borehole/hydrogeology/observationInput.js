import React, { forwardRef, useState, useEffect } from "react";
import { FormProvider, useFormContext } from "react-hook-form";
import { MenuItem, Stack } from "@mui/material";
import {
  FormInput,
  FormSelect,
  FormCheckbox,
} from "../../../../components/form/form";
import { useDomains, getCasingsByBoreholeId } from "../../../../api/fetchApiV2";
import { useTranslation } from "react-i18next";
import { hydrogeologySchemaConstants } from "./hydrogeologySchemaConstants";

const ObservationInput = props => {
  const { observation, boreholeId } = props;
  const { t, i18n } = useTranslation();
  const domains = useDomains();
  const formMethods = useFormContext();
  const [casings, setCasings] = useState([]);

  useEffect(() => {
    if (boreholeId) {
      getCasingsByBoreholeId(boreholeId).then(casings => {
        setCasings(casings);
      });
    }
  }, [boreholeId]);

  return (
    <FormProvider {...formMethods}>
      <Stack direction="row">
        <FormInput
          fieldName="fromDepthM"
          label="fromdepth"
          value={observation.fromDepthM}
          type="number"
        />
        <FormInput
          fieldName="toDepthM"
          label="todepth"
          value={observation.toDepthM}
          type="number"
        />
      </Stack>
      <Stack direction="row">
        <FormInput
          fieldName="fromDepthMasl"
          label="fromDepthMasl"
          value={observation.fromDepthMasl}
          type="number"
        />
        <FormInput
          fieldName="toDepthMasl"
          label="toDepthMasl"
          value={observation.toDepthMasl}
          type="number"
        />
      </Stack>
      <Stack direction="row">
        <FormInput
          fieldName="startTime"
          label="startTime"
          value={observation.startTime}
          type="datetime-local"
          required={true}
        />
        <FormInput
          fieldName="endTime"
          label="endTime"
          value={observation.endTime}
          type="datetime-local"
        />
      </Stack>
      <Stack direction="row">
        <FormSelect
          fieldName="reliability"
          label="reliability"
          selected={observation.reliabilityId}
          required={true}>
          {domains?.data
            ?.filter(
              d =>
                d.schema === hydrogeologySchemaConstants.observationReliability,
            )
            .sort((a, b) => a.order - b.order)

            .map(d => (
              <MenuItem key={d.id} value={d.id}>
                {d[i18n.language]}
              </MenuItem>
            ))}
        </FormSelect>
        <FormCheckbox
          fieldName="completionFinished"
          label="completionFinished"
          checked={observation.completionFinished}
          sx={{ marginRight: "0" }}
        />
      </Stack>
      <Stack direction="row">
        <FormSelect
          fieldName="casing"
          label="casing"
          selected={observation?.casingId}
          disabled={!casings?.length}>
          <MenuItem key="0" value={null}>
            <em>{t("reset")}</em>
          </MenuItem>
          {casings?.map(casing => (
            <MenuItem key={casing.id} value={casing.id}>
              {casing.name}
            </MenuItem>
          ))}
        </FormSelect>
        <div style={{ flex: "1" }} />
      </Stack>
      <FormInput
        fieldName="comment"
        label="comment"
        multiline={true}
        rows={3}
        value={observation?.comment}
      />
    </FormProvider>
  );
};

export default ObservationInput;
