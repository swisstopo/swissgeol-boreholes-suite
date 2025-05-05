import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { Casing } from "../../../../api/apiInterfaces.ts";
import { getCasingsByBoreholeId } from "../../../../api/fetchApiV2.js";
import { FormInput, FormSelect, FormValueType } from "../../../../components/form/form";
import { FormContainer } from "../../../../components/form/formContainer";
import { FormDomainSelect } from "../../../../components/form/formDomainSelect";
import { useGetCasingOptions } from "../completion/casingUtils.jsx";
import DepthInput from "./depthInput.tsx";
import { hydrogeologySchemaConstants } from "./hydrogeologySchemaConstants.ts";
import { ObservationInputProps } from "./Observation.ts";

const ObservationInput = ({ observation, showDepthInputs = true }: ObservationInputProps) => {
  const [casings, setCasings] = useState<Casing[]>([]);
  const { id: boreholeId } = useParams<{ id: string }>();
  const getCasingOptions = useGetCasingOptions();

  useEffect(() => {
    if (boreholeId) {
      getCasingsByBoreholeId(Number(boreholeId)).then(casings => {
        setCasings(casings);
      });
    }
  }, [boreholeId]);

  return (
    <>
      {showDepthInputs && (
        <DepthInput
          observation={observation}
          depthFields={[
            {
              fieldNameMD: "fromDepthM",
              labelMD: "fromdepth",
              getValueMD: () => observation.fromDepthM,
              fieldNameMasl: "fromDepthMasl",
              labelMasl: "fromDepthMasl",
              getValueMasl: () => observation.fromDepthMasl,
            },
            {
              fieldNameMD: "toDepthM",
              labelMD: "todepth",
              getValueMD: () => observation.toDepthM,
              fieldNameMasl: "toDepthMasl",
              labelMasl: "toDepthMasl",
              getValueMasl: () => observation.toDepthMasl,
            },
          ]}
        />
      )}
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
            selected={observation.reliabilityId as number}
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
