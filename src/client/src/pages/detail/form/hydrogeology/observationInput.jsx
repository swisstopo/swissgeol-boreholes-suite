import { useEffect, useState } from "react";
import { getCasingsByBoreholeId } from "../../../../api/fetchApiV2.js";
import { FormInput, FormSelect, FormValueType } from "../../../../components/form/form";
import { FormContainer } from "../../../../components/form/formContainer";
import { FormDomainSelect } from "../../../../components/form/formDomainSelect";
import { useGetCasingOptions } from "../completion/casingUtils.jsx";
import { hydrogeologySchemaConstants } from "./hydrogeologySchemaConstants";

const ObservationInput = props => {
  const { observation, boreholeId } = props;
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
      <FormContainer direction="row">
        <FormInput
          fieldName="fromDepthM"
          label="fromdepth"
          value={observation.fromDepthM}
          type={FormValueType.Number}
        />
        <FormInput fieldName="toDepthM" label="todepth" value={observation.toDepthM} type={FormValueType.Number} />
      </FormContainer>
      <FormContainer direction="row">
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
      </FormContainer>
      <FormContainer direction="row">
        <FormInput
          fieldName="startTime"
          label="startTime"
          value={observation.startTime}
          type={FormValueType.DateTime}
        />
        <FormInput fieldName="endTime" label="endTime" value={observation.endTime} type={FormValueType.DateTime} />
      </FormContainer>
      <FormContainer direction="row">
        <FormContainer width={"50%"} direction="row">
          <FormDomainSelect
            fieldName="reliabilityId"
            label="reliability"
            selected={observation.reliabilityId}
            schemaName={hydrogeologySchemaConstants.observationReliability}
          />
        </FormContainer>
        <FormContainer width={"50%"} direction="row">
          <FormSelect
            fieldName="casingId"
            label="casingName"
            selected={observation.isOpenBorehole ? -1 : observation.casingId}
            values={getCasingOptions(casings)}
          />
        </FormContainer>
      </FormContainer>
      <FormContainer direction="row">
        <FormInput fieldName="comment" label="comment" multiline={true} rows={3} value={observation?.comment} />
      </FormContainer>
    </>
  );
};

export default ObservationInput;
