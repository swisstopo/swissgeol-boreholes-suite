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

  const [fromDepthM, setFromDepthM] = useState(observation.fromDepthM || null);
  const [toDepthM, setToDepthM] = useState(observation.toDepthM || null);
  const [fromDepthMasl, setFromDepthMasl] = useState(observation.fromDepthMasl || null);
  const [toDepthMasl, setToDepthMasl] = useState(observation.toDepthMasl || null);

  const setValue = (e: number | boolean | null) => {
    if (typeof e !== "number") return;
    setDepthUnit(e);
  };
  const roundTvdValue = (value: number | null) => {
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
    // If 'observation' changes, sync local state with the updated observation
    if (observation) {
      setFromDepthM(observation.fromDepthM);
      setToDepthM(observation.toDepthM);
      setFromDepthMasl(observation.fromDepthMasl);
      setToDepthMasl(observation.toDepthMasl);
    }
  }, [observation]);

  const fetchDepthTVD = useCallback(
    async (fieldValue: number | null) => {
      // check if fieldValue is effectively zero
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
      return roundTvdValue(depth);
    },
    [boreholeId],
  );

  useEffect(() => {
    const fetchAndSetFromDepthMasl = async () => {
      if (depthUnit === ObservationDepthUnitType.measuredDepth) {
        setFromDepthMasl(await fetchDepthTVD(fromDepthM));
        setFormValue("fromDepthMasl", fromDepthMasl);
      }
    };
    fetchAndSetFromDepthMasl();
  }, [depthUnit, fetchDepthTVD, fromDepthM, fromDepthMasl, setFormValue]);

  useEffect(() => {
    const fetchAndSetToDepthMasl = async () => {
      if (depthUnit === ObservationDepthUnitType.measuredDepth) {
        setToDepthMasl(await fetchDepthTVD(toDepthM));
        setFormValue("toDepthMasl", toDepthMasl);
      }
    };
    fetchAndSetToDepthMasl();
  }, [depthUnit, fetchDepthTVD, setFormValue, toDepthM, toDepthMasl]);

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
              value={fromDepthM ?? undefined}
              type={FormValueType.Number}
              onUpdate={(value: string) => setFromDepthM(parseFloat(value) || 0)} // Convert the value to a number
            />
            <FormInput
              fieldName="toDepthM"
              label="todepth"
              value={toDepthM ?? undefined}
              type={FormValueType.Number}
              onUpdate={(value: string) => setToDepthM(parseFloat(value) || 0)} // Convert the value to a number
            />
          </FormContainer>
          <FormContainer direction="row">
            <FormInput
              key={`fromDepthMasl-${fromDepthMasl}`} // Unique key forces re-render
              fieldName="fromDepthMasl"
              label="fromDepthMasl"
              value={fromDepthMasl ?? undefined}
              type={FormValueType.Number}
              disabled={depthUnit === ObservationDepthUnitType.measuredDepth} // This ensures it is disabled when depthUnit is METERS
            />
            <FormInput
              key={`toDepthMasl-${toDepthMasl}`} // Unique key forces re-render
              fieldName="toDepthMasl"
              label="toDepthMasl"
              value={toDepthMasl ?? undefined}
              type={FormValueType.Number}
              disabled={depthUnit === ObservationDepthUnitType.measuredDepth} // Same here for the 'to' field
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
