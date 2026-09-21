import { useContext } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Check, X } from "lucide-react";
import { getBoreholeGeometryDepthMasl, getBoreholeGeometryDepthMDFromMasl } from "../../../../api/fetchApiV2.js";
import { VerticalReferenceSystem } from "../../../../api/generated";
import { FormInput, FormSelect, FormValueType } from "../../../../components/form/form";
import { FormContainer } from "../../../../components/form/formContainer";
import { formatNumberForDisplay, parseFloatWithThousandsSeparator } from "../../../../components/form/formUtils.ts";
import { PromptContext } from "../../../../components/prompt/promptContext.tsx";
import { useRequiredId } from "../../../../hooks/useRequiredId.ts";
import { DepthInputProps, verticalReferenceSystems } from "./Observation.ts";

const DepthInput = ({ observation, depthFields }: DepthInputProps) => {
  const { t } = useTranslation();
  const { showPrompt } = useContext(PromptContext);
  const formMethods = useFormContext();
  const boreholeId = useRequiredId();

  const depthUnitFieldName = "originalVerticalReferenceSystem";
  // The form has no value type here, so react-hook-form reports every field as `any`.
  const watchDepthUnit = formMethods.watch(
    depthUnitFieldName,
    verticalReferenceSystems.measuredDepth,
  ) as ObservationDepthUnitType;

  const convertDepth = async (inputFieldName: string, outputFieldName: string, outputUnit: VerticalReferenceSystem) => {
    if (outputUnit === watchDepthUnit) return;

    const inputValue = formMethods.getValues(inputFieldName) as string;
    const inputParsed = parseFloatWithThousandsSeparator(inputValue);
    if (inputParsed === null) {
      formMethods.setValue(outputFieldName, "");
    } else {
      let result = null;
      switch (outputUnit) {
        case verticalReferenceSystems.measuredDepth: {
          result = await getBoreholeGeometryDepthMDFromMasl(boreholeId, inputParsed);
          break;
        }
        case verticalReferenceSystems.masl: {
          result = await getBoreholeGeometryDepthMasl(boreholeId, inputParsed);
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

  const onCancelDepthUnitChange = (newDepthUnit: number) => {
    // Reset the value to the previous one.
    if (newDepthUnit === verticalReferenceSystems.measuredDepth) {
      formMethods.setValue(depthUnitFieldName, verticalReferenceSystems.masl);
    } else {
      formMethods.setValue(depthUnitFieldName, verticalReferenceSystems.measuredDepth);
    }
  };

  const onDepthUnitChange = (newDepthUnit: number | string | boolean | null) => {
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

  const originalDepthUnit = observation.originalVerticalReferenceSystem;
  const selectedDepthUnit =
    originalDepthUnit == null || originalDepthUnit === verticalReferenceSystems.unknown
      ? verticalReferenceSystems.measuredDepth
      : originalDepthUnit;

  return (
    <>
      <FormSelect
        canReset={false}
        fieldName={depthUnitFieldName}
        label={t("verticalReferenceSystem")}
        selected={selectedDepthUnit}
        onUpdate={onDepthUnitChange}
        values={[
          { key: verticalReferenceSystems.measuredDepth, name: t("measuredDepth") },
          { key: verticalReferenceSystems.masl, name: t("metersAboveSeaLevel") },
        ]}
      />
      {depthFields.map(fields => (
        <FormContainer direction="row" key={fields.fieldNameMD}>
          <FormInput
            fieldName={fields.fieldNameMD}
            label={fields.labelMD}
            value={fields.getValueMD()}
            type={FormValueType.Number}
            onUpdate={() => void convertDepth(fields.fieldNameMD, fields.fieldNameMasl, verticalReferenceSystems.masl)}
            disabled={watchDepthUnit !== verticalReferenceSystems.measuredDepth}
          />
          <FormInput
            fieldName={fields.fieldNameMasl}
            label={fields.labelMasl}
            value={fields.getValueMasl()}
            type={FormValueType.Number}
            onUpdate={() =>
              void convertDepth(fields.fieldNameMasl, fields.fieldNameMD, verticalReferenceSystems.measuredDepth)
            }
            disabled={watchDepthUnit !== verticalReferenceSystems.masl}
          />
        </FormContainer>
      ))}
    </>
  );
};

export default DepthInput;
