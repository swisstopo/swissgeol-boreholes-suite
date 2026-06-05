import { FC, useContext, useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Delete from "@mui/icons-material/Delete";
import { Box, IconButton, InputAdornment, Typography } from "@mui/material";
import { useReloadBoreholes } from "../../../../../api/borehole.ts";
import { FieldMeasurement, FieldMeasurementResult } from "../../../../../api/generated";
import { AddButton } from "../../../../../components/buttons/buttons.tsx";
import { useCodelists } from "../../../../../components/codelist.ts";
import { DataCardContext } from "../../../../../components/dataCard/dataCardContext.tsx";
import { DataCardSaveAndCancelButtons } from "../../../../../components/dataCard/saveAndCancelButtons.tsx";
import { useUnsavedChangesPrompt } from "../../../../../components/dataCard/useUnsavedChangesPrompt.tsx";
import { FormContainer, FormInput, FormValueType } from "../../../../../components/form/form.js";
import { FormDomainSelect } from "../../../../../components/form/formDomainSelect.js";
import { parseFloatWithThousandsSeparator } from "../../../../../components/form/formUtils.ts";
import { useFormDirtyMarkAsChanged } from "../../../../../components/form/useFormDirty.tsx";
import { useValidateFormOnMount } from "../../../../../components/form/useValidateFormOnMount.tsx";
import { useResetTabStatus } from "../../../../../hooks/useResetTabStatus.ts";
import { prepareCasingDataForSubmit } from "../../completion/casingUtils.tsx";
import { hydrogeologySchemaConstants } from "../hydrogeologySchemaConstants.ts";
import { ObservationType, prepareObservationDataForSubmit } from "../Observation.ts";
import ObservationInput from "../observationInput.tsx";
import { getFieldMeasurementParameterUnits } from "../parameterUnits.js";
import { addFieldMeasurement, FieldMeasurementInputProps, updateFieldMeasurement } from "./FieldMeasurement.ts";

interface FieldMeasurementResultFormData {
  id?: number;
  sampleTypeId?: number | null;
  parameterId?: number | null;
  value?: number | null;
}

type FieldMeasurementFormData = Omit<FieldMeasurement, "fieldMeasurementResults"> & {
  fieldMeasurementResults?: FieldMeasurementResultFormData[] | null;
};

export const FieldMeasurementInput: FC<FieldMeasurementInputProps> = ({ item, parentId }) => {
  const { t } = useTranslation();
  const { triggerReload } = useContext(DataCardContext);
  const codelists = useCodelists();
  const reloadBoreholes = useReloadBoreholes();
  const resetTabStatus = useResetTabStatus(["fieldMeasurement"]);

  const formMethods = useForm<FieldMeasurementFormData>({
    mode: "all",
    defaultValues: {
      fieldMeasurementResults: item?.fieldMeasurementResults || [
        { parameterId: undefined, value: undefined, sampleTypeId: undefined },
      ],
    },
  });
  const { formState, handleSubmit, control, getValues, trigger } = formMethods;
  const { fields, append, remove } = useFieldArray({
    name: "fieldMeasurementResults",
    control: control,
  });
  const [units, setUnits] = useState<Record<number, string>>({});

  const submitForm = (data: FieldMeasurementFormData) => {
    resetTabStatus();
    const prepared = prepareFormDataForSubmit(data);
    if (item.id === 0) {
      addFieldMeasurement({
        ...prepared,
      }).then(() => {
        triggerReload();
        reloadBoreholes();
      });
    } else {
      updateFieldMeasurement({
        ...item,
        ...prepared,
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
  useFormDirtyMarkAsChanged({ formState });

  useEffect(() => {
    trigger("fieldMeasurementResults");
    let currentUnits = {};
    getValues()["fieldMeasurementResults"]?.forEach((element, index) => {
      currentUnits = {
        ...currentUnits,
        [index]: getFieldMeasurementParameterUnits(element.parameterId as number, codelists.data),
      };
    });
    setUnits(currentUnits);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getValues()["fieldMeasurementResults"]]);

  const prepareFormDataForSubmit = (data: FieldMeasurementFormData): FieldMeasurement => {
    let prepared: FieldMeasurement = prepareCasingDataForSubmit(data) as FieldMeasurement;
    prepared = prepareObservationDataForSubmit(prepared, parentId);
    prepared.type = ObservationType.fieldMeasurement;

    if (data.fieldMeasurementResults) {
      prepared.fieldMeasurementResults = data.fieldMeasurementResults.map(r => ({
        id: r.id ?? 0,
        sampleTypeId: r.sampleTypeId ?? 0,
        parameterId: r.parameterId ?? 0,
        fieldMeasurementId: 0,
        value: parseFloatWithThousandsSeparator(r.value) ?? undefined,
      })) as FieldMeasurementResult[];
    }
    return prepared;
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
                  append({ parameterId: undefined, value: undefined, sampleTypeId: undefined }, { shouldFocus: false });
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
                    setUnits({ ...units, [index]: getFieldMeasurementParameterUnits(value as number, codelists.data) });
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
