import { useContext } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Check, X } from "lucide-react";
import { getBoreholeGeometryDepthMasl, getBoreholeGeometryDepthMDFromMasl } from "../../../../api/fetchApiV2.js";
import { FormInput, FormSelect } from "../../../../components/form/form";
import { FormContainer } from "../../../../components/form/formContainer";
import { formatNumberForDisplay, parseFloatWithThousandsSeparator } from "../../../../components/form/formUtils.ts";
import { PromptContext } from "../../../../components/prompt/promptContext.tsx";
import { DepthInputProps, ObservationDepthUnitType } from "./Observation.ts";

const DepthInput = ({ observation, depthFields }: DepthInputProps) => {
  const { t } = useTranslation();
  const { showPrompt } = useContext(PromptContext);
  const formMethods = useFormContext();
  const { id: boreholeId } = useParams<{ id: string }>();

  const depthUnitFieldName = "originalVerticalReferenceSystem";
  const watchDepthUnit = formMethods.watch(depthUnitFieldName, ObservationDepthUnitType.measuredDepth);

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
    depthFields.forEach(fields => {
      formMethods.setValue(fields.fieldNameMD, "", { shouldValidate: true, shouldDirty: true });
      formMethods.setValue(fields.fieldNameMasl, "", { shouldValidate: true, shouldDirty: true });
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
    const areDepthValuesSet = formMethods
      .getValues(depthFields.flatMap(fields => [fields.fieldNameMD, fields.fieldNameMasl]))
      .some(value => value);

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
      {depthFields.map(fields => (
        <FormContainer direction="row" key={fields.fieldNameMD}>
          <FormInput
            fieldName={fields.fieldNameMD}
            label={fields.labelMD}
            value={fields.getValueMD()}
            controlledValue={formMethods.watch(fields.fieldNameMD)}
            withThousandSeparator={true}
            onUpdate={() => convertDepth(fields.fieldNameMD, fields.fieldNameMasl, ObservationDepthUnitType.masl)}
            disabled={watchDepthUnit !== ObservationDepthUnitType.measuredDepth}
          />
          <FormInput
            fieldName={fields.fieldNameMasl}
            label={fields.labelMasl}
            value={fields.getValueMasl()}
            controlledValue={formMethods.watch(fields.fieldNameMasl)}
            withThousandSeparator={true}
            onUpdate={() =>
              convertDepth(fields.fieldNameMasl, fields.fieldNameMD, ObservationDepthUnitType.measuredDepth)
            }
            disabled={watchDepthUnit !== ObservationDepthUnitType.masl}
          />
        </FormContainer>
      ))}
    </>
  );
};

export default DepthInput;
