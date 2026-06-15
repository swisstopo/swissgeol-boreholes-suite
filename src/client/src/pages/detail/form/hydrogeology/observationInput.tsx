import { useEffect, useState } from "react";
import { getCasingsByBoreholeId } from "../../../../api/fetchApiV2.js";
import { Casing } from "../../../../api/generated";
import { FormInput, FormSelect, FormValueType } from "../../../../components/form/form";
import { FormContainer } from "../../../../components/form/formContainer";
import { FormDomainSelect } from "../../../../components/form/formDomainSelect";
import { useRequiredId } from "../../../../hooks/useRequiredId.ts";
import { useGetCasingOptions } from "../completion/casingUtils.tsx";
import DepthInput from "./depthInput.tsx";
import { hydrogeologySchemaConstants } from "./hydrogeologySchemaConstants.ts";
import { ObservationInputProps } from "./Observation.ts";

const ObservationInput = ({ observation, showDepthInputs = true }: ObservationInputProps) => {
  const [casings, setCasings] = useState<Casing[]>([]);
  const boreholeId = useRequiredId();
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
