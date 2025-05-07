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
import { FormContainer, FormInput } from "../../../../../components/form/form.js";
import { FormDomainSelect } from "../../../../../components/form/formDomainSelect.js";
import { parseFloatWithThousandsSeparator } from "../../../../../components/form/formUtils.ts";
import { useFormDirtyChanges } from "../../../../../components/form/useFormDirtyChanges.tsx";
import { useValidateFormOnMount } from "../../../../../components/form/useValidateFormOnMount.tsx";
import { useBlockNavigation } from "../../../../../hooks/useBlockNavigation.tsx";
import { DetailContext } from "../../../detailContext.tsx";
import { prepareCasingDataForSubmit } from "../../completion/casingUtils.jsx";
import { hydrogeologySchemaConstants } from "../hydrogeologySchemaConstants.ts";
import { ObservationType, prepareObservationDataForSubmit } from "../Observation.ts";
import ObservationInput from "../observationInput.tsx";
import { getFieldMeasurementParameterUnits } from "../parameterUnits.js";
import {
  addFieldMeasurement,
  FieldMeasurement,
  FieldMeasurementInputProps,
  updateFieldMeasurement,
} from "./FieldMeasurement.ts";

export const FieldMeasurementInput: FC<FieldMeasurementInputProps> = ({ item, parentId }) => {
  const { t } = useTranslation();
  const { triggerReload } = useContext(DataCardContext);
  const { reloadBorehole } = useContext(DetailContext);
  useBlockNavigation();
  const domains = useDomains();

  const formMethods = useForm<FieldMeasurement>({
    mode: "all",
    defaultValues: {
      fieldMeasurementResults: item?.fieldMeasurementResults || [
        { parameterId: null, value: null, sampleTypeId: null },
      ],
    },
  });
  const { formState, handleSubmit, control, getValues, trigger } = formMethods;
  const { fields, append, remove } = useFieldArray({
    name: "fieldMeasurementResults",
    control: control,
  });
  const [units, setUnits] = useState<Record<number, string>>({});

  const submitForm = (data: FieldMeasurement) => {
    data = prepareFormDataForSubmit(data);
    if (item.id === 0) {
      addFieldMeasurement({
        ...data,
      }).then(() => {
        triggerReload();
        reloadBorehole();
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
  useFormDirtyChanges({ formState });

  useEffect(() => {
    trigger("fieldMeasurementResults");
    let currentUnits = {};
    getValues()["fieldMeasurementResults"].forEach((element, index) => {
      currentUnits = {
        ...currentUnits,
        [index]: getFieldMeasurementParameterUnits(element.parameterId as number, domains.data),
      };
    });
    setUnits(currentUnits);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getValues()["fieldMeasurementResults"]]);

  const prepareFormDataForSubmit = (data: FieldMeasurement) => {
    data = prepareCasingDataForSubmit(data);
    data = prepareObservationDataForSubmit(data, parentId);
    data.type = ObservationType.fieldMeasurement;

    if (data.fieldMeasurementResults) {
      data.fieldMeasurementResults = data.fieldMeasurementResults.map(r => {
        return {
          id: r.id,
          sampleTypeId: r.sampleTypeId,
          parameterId: r.parameterId,
          value: parseFloatWithThousandsSeparator(r.value),
        };
      });
    }
    return data;
  };

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(submitForm)}>
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
                  withThousandSeparator={true}
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
