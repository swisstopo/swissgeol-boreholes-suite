import { useEffect, useState } from "react";
import { Stack } from "@mui/material";
import { FormInput, FormSelect, FormValueType } from "../../../../components/form/form";
import { useTranslation } from "react-i18next";
import { hydrogeologySchemaConstants } from "./hydrogeologySchemaConstants";
import { useGetCasingOptions } from "../completion/casingUtils.jsx";
import { getCasingsByBoreholeId, useDomains } from "../../../../api/fetchApiV2.js";
import { StackHalfWidth } from "../../../../components/styledComponents.ts";

const ObservationInput = props => {
  const { observation, boreholeId } = props;
  const { i18n } = useTranslation();
  const domains = useDomains();
  const [casings, setCasings] = useState([]);
  const getCasingOptions = useGetCasingOptions();

  useEffect(() => {
    if (boreholeId) {
      getCasingsByBoreholeId(boreholeId).then(casings => {
        setCasings(casings);
      });
    }
  }, [boreholeId]);

  return (
    <>
      <Stack direction="row">
        <FormInput
          fieldName="fromDepthM"
          label="fromdepth"
          value={observation.fromDepthM}
          type={FormValueType.Number}
        />
        <FormInput fieldName="toDepthM" label="todepth" value={observation.toDepthM} type={FormValueType.Number} />
      </Stack>
      <Stack direction="row">
        <FormInput
          fieldName="fromDepthMasl"
          label="fromDepthMasl"
          value={observation.fromDepthMasl}
          type={FormValueType.Number}
        />
        <FormInput
          fieldName="toDepthMasl"
          label="toDepthMasl"
          value={observation.toDepthMasl}
          type={FormValueType.Number}
        />
      </Stack>
      <Stack direction="row">
        <FormInput
          fieldName="startTime"
          label="startTime"
          value={observation.startTime}
          type={FormValueType.DateTime}
        />
        <FormInput fieldName="endTime" label="endTime" value={observation.endTime} type={FormValueType.DateTime} />
      </Stack>
      <Stack direction="row">
        <StackHalfWidth direction="row">
          <FormSelect
            fieldName="reliabilityId"
            label="reliability"
            selected={observation.reliabilityId}
            values={domains?.data
              ?.filter(d => d.schema === hydrogeologySchemaConstants.observationReliability)
              .sort((a, b) => a.order - b.order)
              .map(d => ({
                key: d.id,
                name: d[i18n.language],
              }))}
          />
        </StackHalfWidth>
        <StackHalfWidth direction="row">
          <FormSelect
            fieldName="casingId"
            label="casingName"
            selected={observation.isOpenBorehole ? -1 : observation.casingId}
            values={getCasingOptions(casings)}
          />
        </StackHalfWidth>
      </Stack>
      <Stack direction="row">
        <FormInput fieldName="comment" label="comment" multiline={true} rows={3} value={observation?.comment} />
      </Stack>
    </>
  );
};

export default ObservationInput;
