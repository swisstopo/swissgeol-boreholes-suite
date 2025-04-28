import { useCallback, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Casing } from "../../../../api/apiInterfaces.ts";
import { getCasingsByBoreholeId } from "../../../../api/fetchApiV2.js";
import { FormInput, FormSelect, FormValueType } from "../../../../components/form/form";
import { FormContainer } from "../../../../components/form/formContainer";
import { FormDomainSelect } from "../../../../components/form/formDomainSelect";
import { parseFloatWithThousandsSeparator } from "../../../../components/form/formUtils.ts";
import { useGetCasingOptions } from "../completion/casingUtils.jsx";
import { hydrogeologySchemaConstants } from "./hydrogeologySchemaConstants.ts";
import { ObservationDepthUnitType, ObservationInputProps } from "./Observation.ts";

const ObservationInput = ({ observation, showDepthInputs = true }: ObservationInputProps) => {
  const { t } = useTranslation();
  const { setValue: setFormValue, watch: formWatch } = useFormContext();
  const [casings, setCasings] = useState<Casing[]>([]);
  const { id: boreholeId } = useParams<{ id: string }>();
  const getCasingOptions = useGetCasingOptions();

  const depthUnitFieldName = "depthUnit";
  const watchDepthUnit = formWatch(depthUnitFieldName, ObservationDepthUnitType.measuredDepth);

  const roundValue = (value: number | null) => {
    return value ? Math.round(value * 100) / 100 : null;
  };

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
        <>
          <FormSelect
            canReset={false}
            fieldName={depthUnitFieldName}
            label={t("verticalReferenceSystem")}
            selected={
              observation.originalVerticalReferenceSystem === ObservationDepthUnitType.unknown
                ? ObservationDepthUnitType.measuredDepth
                : observation.originalVerticalReferenceSystem
            }
            values={[
              { key: ObservationDepthUnitType.measuredDepth, name: t("measuredDepth") },
              { key: ObservationDepthUnitType.masl, name: t("metersAboveSeaLevel") },
            ]}
          />
          <FormContainer direction="row">
            <FormInput
              fieldName="fromDepthM"
              label="fromdepth"
              value={observation.fromDepthM}
              withThousandSeparator={true}
              disabled={watchDepthUnit !== ObservationDepthUnitType.measuredDepth}
            />
            <FormInput
              fieldName="toDepthM"
              label="todepth"
              value={observation.toDepthM}
              withThousandSeparator={true}
              disabled={watchDepthUnit !== ObservationDepthUnitType.measuredDepth}
            />
          </FormContainer>
          <FormContainer direction="row">
            <FormInput
              fieldName="fromDepthMasl"
              label="fromDepthMasl"
              value={observation.fromDepthMasl}
              withThousandSeparator={true}
              disabled={watchDepthUnit !== ObservationDepthUnitType.masl}
            />
            <FormInput
              fieldName="toDepthMasl"
              label="toDepthMasl"
              value={observation.toDepthMasl}
              withThousandSeparator={true}
              disabled={watchDepthUnit !== ObservationDepthUnitType.masl}
            />
          </FormContainer>
        </>
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
