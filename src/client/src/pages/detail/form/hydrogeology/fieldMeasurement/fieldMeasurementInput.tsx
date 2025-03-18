import { FC, useContext, useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Delete from "@mui/icons-material/Delete";
import { Box, IconButton, InputAdornment, Typography } from "@mui/material";
import { useDomains } from "../../../../../api/fetchApiV2.js";
import { AddButton } from "../../../../../components/buttons/buttons.tsx";
import { DataCardContext } from "../../../../../components/dataCard/dataCardContext.tsx";
import { DataCardSaveAndCancelButtons } from "../../../../../components/dataCard/saveAndCancelButtons.tsx";
import { useUnsavedChangesPrompt } from "../../../../../components/dataCard/useUnsavedChangesPrompt.tsx";
import { FormContainer, FormInput, FormValueType } from "../../../../../components/form/form.js";
import { FormDomainSelect } from "../../../../../components/form/formDomainSelect.js";
import { useValidateFormOnMount } from "../../../../../components/form/useValidateFormOnMount.tsx";
import { prepareCasingDataForSubmit } from "../../completion/casingUtils.jsx";
import { getIsoDateIfDefined } from "../hydrogeologyFormUtils.ts";
import { hydrogeologySchemaConstants } from "../hydrogeologySchemaConstants.ts";
import { ObservationType } from "../Observation.ts";
import ObservationInput from "../observationInput.tsx";
import { getFieldMeasurementParameterUnits } from "../parameterUnits.js";
import {
  addFieldMeasurement,
  FieldMeasurement,
  FieldMeasurementInputProps,
  updateFieldMeasurement,
} from "./FieldMeasurement.ts";

export const FieldMeasurementInput: FC<FieldMeasurementInputProps> = ({ item, parentId }) => {
  const { triggerReload } = useContext(DataCardContext);
  const domains = useDomains();
  const { t } = useTranslation();
  const formMethods = useForm<FieldMeasurement>({
    mode: "all",
    defaultValues: {
      fieldMeasurementResults: item?.fieldMeasurementResults || [
        { parameterId: null, value: null, sampleTypeId: null },
      ],
    },
  });
  const { fields, append, remove } = useFieldArray({
    name: "fieldMeasurementResults",
    control: formMethods.control,
  });
  const [units, setUnits] = useState<Record<number, string>>({});

  const submitForm = (data: FieldMeasurement) => {
    data = prepareFormDataForSubmit(data);
    if (item.id === 0) {
      addFieldMeasurement({
        ...data,
      }).then(() => {
        triggerReload();
      });
    } else {
      updateFieldMeasurement({
        ...item,
        ...data,
      }).then(() => {
        triggerReload();
      });
    }
  };

  useUnsavedChangesPrompt({
    formMethods,
    submitForm,
    translationKey: "fieldMeasurement",
  });

  useValidateFormOnMount({ formMethods });

  useEffect(() => {
    formMethods.trigger("fieldMeasurementResults");
    let currentUnits = {};
    formMethods.getValues()["fieldMeasurementResults"].forEach((element, index) => {
      currentUnits = {
        ...currentUnits,
        [index]: getFieldMeasurementParameterUnits(element.parameterId as number, domains.data),
      };
    });
    setUnits(currentUnits);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMethods.getValues()["fieldMeasurementResults"]]);

  const prepareFormDataForSubmit = (data: FieldMeasurement) => {
    data = prepareCasingDataForSubmit(data);
    data.startTime = getIsoDateIfDefined(data?.startTime);
    data.endTime = getIsoDateIfDefined(data?.endTime);
    data.type = ObservationType.fieldMeasurement;
    data.boreholeId = parentId;

    if (data.reliabilityId === "") {
      data.reliabilityId = null;
    }
    delete data.reliability;

    if (data.fieldMeasurementResults) {
      data.fieldMeasurementResults = data.fieldMeasurementResults.map(r => {
        return {
          id: r.id,
          sampleTypeId: r.sampleTypeId,
          parameterId: r.parameterId,
          value: r.value,
        };
      });
    }
    return data;
  };

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(submitForm)}>
        <FormContainer>
          <ObservationInput observation={item} />
          <Box
            sx={{
              paddingBottom: "8.5px",
              marginRight: "8px !important",
              marginTop: "18px !important",
            }}>
            <FormContainer direction={"row"} justifyContent={"space-between"}>
              <Typography sx={{ mr: 1, mt: 2, fontWeight: "bold" }}>{t("fieldMeasurementResult")}</Typography>
              <AddButton
                label="addFieldMeasurementResult"
                onClick={() => {
                  append({ parameterId: null, value: null, sampleTypeId: null }, { shouldFocus: false });
                }}
              />
            </FormContainer>
            {fields.map((field, index) => (
              <FormContainer
                direction={"row"}
                key={field.id}
                marginTop="8px"
                data-cy={`fieldMeasurementResult-${index}`}>
                <FormDomainSelect
                  fieldName={`fieldMeasurementResults.${index}.sampleTypeId`}
                  label="fieldMeasurementSampleType"
                  selected={field.sampleTypeId}
                  required={true}
                  schemaName={hydrogeologySchemaConstants.fieldMeasurementSampleType}
                />
                <FormDomainSelect
                  fieldName={`fieldMeasurementResults.${index}.parameterId`}
                  label="parameter"
                  selected={field.parameterId}
                  required={true}
                  schemaName={hydrogeologySchemaConstants.fieldMeasurementParameter}
                  onUpdate={value => {
                    setUnits({ ...units, [index]: getFieldMeasurementParameterUnits(value as number, domains.data) });
                  }}
                />
                <FormInput
                  fieldName={`fieldMeasurementResults.${index}.value`}
                  label="value"
                  value={field.value}
                  type={FormValueType.Number}
                  required={true}
                  inputProps={{
                    endAdornment: <InputAdornment position="end">{units[index] ? units[index] : ""}</InputAdornment>,
                  }}
                />
                <IconButton
                  onClick={() => remove(index)}
                  color="error"
                  sx={{
                    marginTop: "10px !important",
                  }}>
                  <Delete />
                </IconButton>
              </FormContainer>
            ))}
          </Box>
        </FormContainer>
        <DataCardSaveAndCancelButtons formMethods={formMethods} submitForm={submitForm} />
      </form>
    </FormProvider>
  );
};

export default FieldMeasurementInput;
