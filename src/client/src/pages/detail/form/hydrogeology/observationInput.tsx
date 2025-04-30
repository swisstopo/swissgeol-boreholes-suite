import { useContext, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Check, X } from "lucide-react";
import { Casing } from "../../../../api/apiInterfaces.ts";
import {
  getBoreholeGeometryDepthMasl,
  getBoreholeGeometryDepthMDFromMasl,
  getCasingsByBoreholeId,
} from "../../../../api/fetchApiV2.js";
import { FormInput, FormSelect, FormValueType } from "../../../../components/form/form";
import { FormContainer } from "../../../../components/form/formContainer";
import { FormDomainSelect } from "../../../../components/form/formDomainSelect";
import { formatNumberForDisplay, parseFloatWithThousandsSeparator } from "../../../../components/form/formUtils.ts";
import { PromptContext } from "../../../../components/prompt/promptContext.tsx";
import { useRequiredParams } from "../../../../hooks/useRequiredParams.ts";
import { useGetCasingOptions } from "../completion/casingUtils.jsx";
import { hydrogeologySchemaConstants } from "./hydrogeologySchemaConstants.ts";
import { ObservationDepthUnitType, ObservationInputProps } from "./Observation.ts";

const ObservationInput = ({ observation, showDepthInputs = true }: ObservationInputProps) => {
  const { t } = useTranslation();
  const { showPrompt } = useContext(PromptContext);
  const formMethods = useFormContext();
  const [casings, setCasings] = useState<Casing[]>([]);
  const { id: boreholeId } = useRequiredParams<{ id: string }>();
  const getCasingOptions = useGetCasingOptions();

  const depthUnitFieldName = "originalVerticalReferenceSystem";
  const fromDepthMFieldName = "fromDepthM";
  const toDepthMFieldName = "toDepthM";
  const fromDepthMaslFieldName = "fromDepthMasl";
  const toDepthMaslFieldName = "toDepthMasl";
  const depthFields = [fromDepthMFieldName, toDepthMFieldName, fromDepthMaslFieldName, toDepthMaslFieldName];
  const watchDepthUnit = formMethods.watch(depthUnitFieldName, ObservationDepthUnitType.measuredDepth);

  useEffect(() => {
    if (boreholeId) {
      getCasingsByBoreholeId(Number(boreholeId)).then(casings => {
        setCasings(casings);
      });
    }
  }, [boreholeId]);

  const convertDepth = async (
    inputFieldName: string,
    outputFieldName: string,
    outputUnit: ObservationDepthUnitType,
  ) => {
    if (outputUnit === watchDepthUnit) return;

    const inputValue = formMethods.getValues(inputFieldName);
    const inputParsed = parseFloatWithThousandsSeparator(inputValue);
    if (inputParsed === null) {
      formMethods.setValue(outputFieldName, "");
    } else {
      let result = null;
      switch (outputUnit) {
        case ObservationDepthUnitType.measuredDepth: {
          result = await getBoreholeGeometryDepthMDFromMasl(Number(boreholeId), inputParsed);
          break;
        }
        case ObservationDepthUnitType.masl: {
          result = await getBoreholeGeometryDepthMasl(Number(boreholeId), inputParsed);
          break;
        }
        default:
          return;
      }

      result = formatNumberForDisplay(result);

      // Check if the input value has changed since the conversion was triggered
      if (inputValue !== formMethods.getValues(inputFieldName)) return;

      formMethods.setValue(outputFieldName, result);
    }
  };

  const clearDepthValues = () => {
    depthFields.forEach(field => {
      formMethods.setValue(field, "", { shouldValidate: true, shouldDirty: true });
    });
  };

  const onCancelDepthUnitChange = (newDepthUnit: ObservationDepthUnitType) => {
    // Reset the value to the previous one.
    if (newDepthUnit == ObservationDepthUnitType.measuredDepth) {
      formMethods.setValue(depthUnitFieldName, ObservationDepthUnitType.masl);
    } else {
      formMethods.setValue(depthUnitFieldName, ObservationDepthUnitType.measuredDepth);
    }
  };

  const onDepthUnitChange = (newDepthUnit: number | boolean | null) => {
    if (typeof newDepthUnit !== "number") return;
    const areDepthValuesSet = formMethods.getValues(depthFields).some(value => value);

    if (!areDepthValuesSet) {
      clearDepthValues();
      return;
    }

    showPrompt(t("changingVerticalReferenceSystemResetsValues"), [
      {
        label: t("cancel"),
        icon: <X />,
        variant: "outlined",
        action: () => onCancelDepthUnitChange(newDepthUnit),
      },
      {
        label: t("confirm"),
        icon: <Check />,
        variant: "contained",
        action: clearDepthValues,
      },
    ]);
  };

  return (
    <>
      {showDepthInputs && (
        <>
          <FormSelect
            canReset={false}
            fieldName={depthUnitFieldName}
            label={t("verticalReferenceSystem")}
            selected={
              observation.originalVerticalReferenceSystem == null ||
              observation.originalVerticalReferenceSystem === ObservationDepthUnitType.unknown
                ? ObservationDepthUnitType.measuredDepth
                : observation.originalVerticalReferenceSystem
            }
            onUpdate={onDepthUnitChange}
            values={[
              { key: ObservationDepthUnitType.measuredDepth, name: t("measuredDepth") },
              { key: ObservationDepthUnitType.masl, name: t("metersAboveSeaLevel") },
            ]}
          />
          <FormContainer direction="row">
            <FormInput
              fieldName={fromDepthMFieldName}
              label="fromdepth"
              value={observation.fromDepthM}
              controlledValue={formMethods.watch(fromDepthMFieldName)}
              withThousandSeparator={true}
              onUpdate={() => convertDepth(fromDepthMFieldName, fromDepthMaslFieldName, ObservationDepthUnitType.masl)}
              disabled={watchDepthUnit !== ObservationDepthUnitType.measuredDepth}
            />
            <FormInput
              fieldName={toDepthMFieldName}
              label="todepth"
              value={observation.toDepthM}
              controlledValue={formMethods.watch(toDepthMFieldName)}
              withThousandSeparator={true}
              onUpdate={() => convertDepth(toDepthMFieldName, toDepthMaslFieldName, ObservationDepthUnitType.masl)}
              disabled={watchDepthUnit !== ObservationDepthUnitType.measuredDepth}
            />
          </FormContainer>
          <FormContainer direction="row">
            <FormInput
              fieldName={fromDepthMaslFieldName}
              label="fromDepthMasl"
              value={observation.fromDepthMasl}
              controlledValue={formMethods.watch(fromDepthMaslFieldName)}
              withThousandSeparator={true}
              onUpdate={() =>
                convertDepth(fromDepthMaslFieldName, fromDepthMFieldName, ObservationDepthUnitType.measuredDepth)
              }
              disabled={watchDepthUnit !== ObservationDepthUnitType.masl}
            />
            <FormInput
              fieldName={toDepthMaslFieldName}
              label="toDepthMasl"
              value={observation.toDepthMasl}
              controlledValue={formMethods.watch(toDepthMaslFieldName)}
              withThousandSeparator={true}
              onUpdate={() =>
                convertDepth(toDepthMaslFieldName, toDepthMFieldName, ObservationDepthUnitType.measuredDepth)
              }
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
