import { useCallback, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { getBoreholeGeometryDepthMasl, getCasingsByBoreholeId } from "../../../../api/fetchApiV2.js";
import { FormInput, FormSelect, FormValueType } from "../../../../components/form/form";
import { FormContainer } from "../../../../components/form/formContainer";
import { FormDomainSelect } from "../../../../components/form/formDomainSelect";
import { parseFloatWithThousandsSeparator } from "../../../../components/legacyComponents/formUtils.ts";
import { useGetCasingOptions } from "../completion/casingUtils.jsx";
import { hydrogeologySchemaConstants } from "./hydrogeologySchemaConstants";
import { ObservationDepthUnitType, ObservationInputProps } from "./Observation.ts";

const ObservationInput = ({ observation, showDepthInputs = true }: ObservationInputProps) => {
  const { t } = useTranslation();
  const { setValue: setFormValue } = useFormContext();
  const [casings, setCasings] = useState([]);
  const { id: boreholeId } = useParams<{ id: string }>();
  const getCasingOptions = useGetCasingOptions();

  const [depthUnit, setDepthUnit] = useState(ObservationDepthUnitType.measuredDepth);
  const [fromDepthM, setFromDepthM] = useState<number | null>(observation.fromDepthM);
  const [toDepthM, setToDepthM] = useState<number | null>(observation.toDepthM);
  const [fromDepthMasl, setFromDepthMasl] = useState<number | null>(observation.fromDepthMasl);
  const [toDepthMasl, setToDepthMasl] = useState<number | null>(observation.toDepthMasl);

  const setValue = (e: number | boolean | null) => {
    if (typeof e !== "number") return;
    setDepthUnit(e);
  };
  const roundValue = (value: number | null) => {
    return value ? Math.round(value * 100) / 100 : null;
  };

  useEffect(() => {
    if (boreholeId) {
      getCasingsByBoreholeId(boreholeId).then(casings => {
        setCasings(casings);
      });
    }
  }, [boreholeId]);

  useEffect(() => {
    if (observation) {
      setFromDepthM(observation.fromDepthM);
      setToDepthM(observation.toDepthM);
      setFromDepthMasl(observation.fromDepthMasl);
      setToDepthMasl(observation.toDepthMasl);
    }
  }, [observation]);

  const fetchDepthMASL = useCallback(
    async (fieldValue: number | null) => {
      if (fieldValue !== null && Math.abs(fieldValue) === 0) {
        return fieldValue;
      }
      if (!fieldValue) return null;
      const getDepthMasl = async (depthMD: number | null) => {
        if (depthMD == null) {
          return null;
        } else {
          const response = await getBoreholeGeometryDepthMasl(boreholeId, depthMD);
          return response ?? null;
        }
      };

      const depth = await getDepthMasl(parseFloatWithThousandsSeparator(fieldValue.toString()));
      return roundValue(depth);
    },
    [boreholeId],
  );

  useEffect(() => {
    const fetchAndSetFromDepthMasl = async () => {
      if (depthUnit === ObservationDepthUnitType.measuredDepth) {
        const depthInMasl = await fetchDepthMASL(fromDepthM);
        setFromDepthMasl(depthInMasl);
        setFormValue("fromDepthMasl", depthInMasl);
      }
    };
    fetchAndSetFromDepthMasl();
  }, [depthUnit, fetchDepthMASL, fromDepthM, fromDepthMasl, setFormValue]);

  useEffect(() => {
    const fetchAndSetToDepthMasl = async () => {
      if (depthUnit === ObservationDepthUnitType.measuredDepth) {
        const depthInMasl = await fetchDepthMASL(toDepthM);
        setToDepthMasl(depthInMasl);
        setFormValue("toDepthMasl", depthInMasl);
      }
    };
    fetchAndSetToDepthMasl();
  }, [depthUnit, fetchDepthMASL, setFormValue, toDepthM, toDepthMasl]);

  return (
    <>
      {showDepthInputs && (
        <>
          <FormSelect
            canReset={false}
            fieldName="depthUnit"
            label={t("autoSetDepthMaslEnabled")}
            selected={depthUnit}
            onUpdate={setValue}
            values={[
              { key: ObservationDepthUnitType.measuredDepth, name: t("yes") },
              { key: ObservationDepthUnitType.masl, name: t("no") },
            ]}
          />
          <FormContainer direction="row">
            <FormInput
              fieldName="fromDepthM"
              label="fromdepth"
              value={fromDepthM}
              type={FormValueType.Number}
              onUpdate={(value: string) => setFromDepthM(parseFloat(value) || 0)}
            />
            <FormInput
              fieldName="toDepthM"
              label="todepth"
              value={toDepthM}
              type={FormValueType.Number}
              onUpdate={(value: string) => setToDepthM(parseFloat(value) || 0)}
            />
          </FormContainer>
          <FormContainer direction="row">
            <FormInput
              key={`fromDepthMasl-${fromDepthMasl}`} // Unique key forces re-render
              fieldName="fromDepthMasl"
              label="fromDepthMasl"
              value={fromDepthMasl}
              type={FormValueType.Number}
              disabled={depthUnit === ObservationDepthUnitType.measuredDepth}
            />
            <FormInput
              key={`toDepthMasl-${toDepthMasl}`} // Unique key forces re-render
              fieldName="toDepthMasl"
              label="toDepthMasl"
              value={toDepthMasl}
              type={FormValueType.Number}
              disabled={depthUnit === ObservationDepthUnitType.measuredDepth}
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
