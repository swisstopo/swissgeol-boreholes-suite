import { useCallback, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Casing } from "../../../../api/apiInterfaces.ts";
import { getBoreholeGeometryDepthMasl, getCasingsByBoreholeId } from "../../../../api/fetchApiV2.js";
import { FormInput, FormSelect, FormValueType } from "../../../../components/form/form";
import { FormContainer } from "../../../../components/form/formContainer";
import { FormDomainSelect } from "../../../../components/form/formDomainSelect";
import { formatNumberForDisplay, parseFloatWithThousandsSeparator } from "../../../../components/form/formUtils.ts";
import { useGetCasingOptions } from "../completion/casingUtils.jsx";
import { hydrogeologySchemaConstants } from "./hydrogeologySchemaConstants.ts";
import { ObservationDepthUnitType, ObservationInputProps } from "./Observation.ts";

const ObservationInput = ({ observation, showDepthInputs = true }: ObservationInputProps) => {
  const { t } = useTranslation();
  const { setValue: setFormValue } = useFormContext();
  const [casings, setCasings] = useState<Casing[]>([]);
  const { id: boreholeId } = useParams<{ id: string }>();
  const getCasingOptions = useGetCasingOptions();

  const [depthUnit, setDepthUnit] = useState(ObservationDepthUnitType.masl);
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
      getCasingsByBoreholeId(Number(boreholeId)).then(casings => {
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
      if (!fieldValue) return null;
      const getDepthMasl = async (depthMD: number | null) => {
        if (depthMD == null) {
          return null;
        } else {
          const response = await getBoreholeGeometryDepthMasl(Number(boreholeId), depthMD);
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
        setFormValue("fromDepthMasl", formatNumberForDisplay(depthInMasl));
      }
    };
    fetchAndSetFromDepthMasl();
  }, [depthUnit, fetchDepthMASL, fromDepthM, fromDepthMasl, setFormValue]);

  useEffect(() => {
    const fetchAndSetToDepthMasl = async () => {
      if (depthUnit === ObservationDepthUnitType.measuredDepth) {
        const depthInMasl = await fetchDepthMASL(toDepthM);
        setToDepthMasl(depthInMasl);
        setFormValue("toDepthMasl", formatNumberForDisplay(depthInMasl));
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
              withThousandSeparator={true}
              onUpdate={(value: string) => setFromDepthM(parseFloatWithThousandsSeparator(value) ?? 0)}
            />
            <FormInput
              fieldName="toDepthM"
              label="todepth"
              value={toDepthM}
              withThousandSeparator={true}
              onUpdate={(value: string) => setToDepthM(parseFloatWithThousandsSeparator(value) ?? 0)}
            />
          </FormContainer>
          <FormContainer direction="row">
            <FormInput
              key={`fromDepthMasl-${fromDepthMasl}`} // Unique key forces re-render
              fieldName="fromDepthMasl"
              label="fromDepthMasl"
              value={fromDepthMasl}
              withThousandSeparator={true}
              disabled={depthUnit === ObservationDepthUnitType.measuredDepth}
            />
            <FormInput
              key={`toDepthMasl-${toDepthMasl}`} // Unique key forces re-render
              fieldName="toDepthMasl"
              label="toDepthMasl"
              value={toDepthMasl}
              withThousandSeparator={true}
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
