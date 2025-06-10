import { FC, useContext, useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Delete from "@mui/icons-material/Delete";
import { Box, IconButton, InputAdornment, Typography } from "@mui/material";
import { AddButton } from "../../../../../components/buttons/buttons";
import { Codelist, useCodelists } from "../../../../../components/codelist.ts";
import { DataCardContext } from "../../../../../components/dataCard/dataCardContext";
import { DataCardSaveAndCancelButtons } from "../../../../../components/dataCard/saveAndCancelButtons.tsx";
import { useUnsavedChangesPrompt } from "../../../../../components/dataCard/useUnsavedChangesPrompt.tsx";
import { FormContainer, FormDomainMultiSelect, FormDomainSelect, FormInput } from "../../../../../components/form/form";
import { parseFloatWithThousandsSeparator } from "../../../../../components/form/formUtils.ts";
import { useFormDirtyChanges } from "../../../../../components/form/useFormDirtyChanges.tsx";
import { useValidateFormOnMount } from "../../../../../components/form/useValidateFormOnMount.tsx";
import { useBlockNavigation } from "../../../../../hooks/useBlockNavigation.tsx";
import { DetailContext } from "../../../detailContext.tsx";
import { prepareCasingDataForSubmit } from "../../completion/casingUtils";
import { hydrogeologySchemaConstants } from "../hydrogeologySchemaConstants";
import { ObservationType, prepareObservationDataForSubmit } from "../Observation";
import ObservationInput from "../observationInput";
import { getHydrotestParameterUnits } from "../parameterUnits";
import { addHydrotest, Hydrotest, HydrotestInputProps, updateHydrotest, useHydrotestDomains } from "./Hydrotest";

export const HydrotestInput: FC<HydrotestInputProps> = ({ item, parentId }) => {
  const { t } = useTranslation();
  const { triggerReload } = useContext(DataCardContext);
  const { reloadBorehole } = useContext(DetailContext);
  useBlockNavigation();
  const codelists = useCodelists();

  const formMethods = useForm<Hydrotest>({
    mode: "all",
    defaultValues: {
      hydrotestResults: item?.hydrotestResults || [],
    },
  });
  const { formState, handleSubmit, control, getValues, setValue, trigger } = formMethods;

  const { fields, append, remove } = useFieldArray({
    name: "hydrotestResults",
    control: control,
  });
  const [units, setUnits] = useState<Record<number, string>>({});
  const [hydrotestKindIds, setHydrotestKindIds] = useState<number[]>(item?.kindCodelists?.map(c => c.id) || []);
  const filteredTestKindDomains = useHydrotestDomains(hydrotestKindIds);

  const submitForm = (data: Hydrotest) => {
    const hydrotest: Hydrotest = prepareFormDataForSubmit(data);

    if (item.id === 0) {
      addHydrotest({
        ...hydrotest,
      }).then(() => {
        triggerReload();
        reloadBorehole();
      });
    } else {
      updateHydrotest({
        ...item,
        ...hydrotest,
      }).then(() => {
        triggerReload();
      });
    }
  };

  useUnsavedChangesPrompt({
    formMethods,
    submitForm,
    translationKey: "hydrotest",
  });

  useValidateFormOnMount({ formMethods });
  useFormDirtyChanges({ formState });

  const getFilteredDomains = (schema: string, data: Codelist[]) =>
    data?.filter(c => c.schema === schema).map(c => c.id) || [];

  const getCompatibleValues = (allowedIds: number[], formValues: number[]) =>
    formValues?.filter(c => allowedIds.includes(c)) || [];

  useEffect(() => {
    if (hydrotestKindIds.length > 0) {
      // check the compatibility of codelists (flowdirection, evaluationMethod, hydrotestResultParameter) when the hydrotestKinds (and therefore the filteredTestKindDomains) change.
      if (filteredTestKindDomains.data?.length > 0) {
        const formValues = getValues();
        // delete flowDirections, evaluationMethods that are no longer compatible with the selected hydrotestKinds.
        const allowedEvaluationMethodIds = getFilteredDomains(
          hydrogeologySchemaConstants.hydrotestEvaluationMethod,
          filteredTestKindDomains.data,
        );
        const allowedFlowDirectionIds = getFilteredDomains(
          hydrogeologySchemaConstants.hydrotestFlowDirection,
          filteredTestKindDomains.data,
        );
        let compatibleEvaluationMethods: number[] = [];
        if (formValues.evaluationMethodId) {
          compatibleEvaluationMethods = getCompatibleValues(allowedEvaluationMethodIds, formValues.evaluationMethodId);
        }
        let compatibleFlowDirections: number[] = [];
        if (formValues.flowDirectionId) {
          compatibleFlowDirections = getCompatibleValues(allowedFlowDirectionIds, formValues.flowDirectionId);
        }

        // set form values
        setValue("evaluationMethodId", compatibleEvaluationMethods);
        setValue("flowDirectionId", compatibleFlowDirections);

        // delete hydrotestResults that are not longer compatible with the selected hydrotestKinds.
        const allowedHydrotestResultParameterIds = getFilteredDomains(
          hydrogeologySchemaConstants.hydrotestResultParameter,
          filteredTestKindDomains.data,
        );

        const compatibleHydrotestResults = formValues.hydrotestResults?.filter(
          r => (r.parameterId && allowedHydrotestResultParameterIds.includes(r.parameterId)) || [],
        );

        setValue("hydrotestResults", compatibleHydrotestResults);
      }
    } else {
      setValue("flowDirectionId", []);
      setValue("evaluationMethodId", []);
      setValue("hydrotestResults", []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrotestKindIds]);

  useEffect(() => {
    trigger("hydrotestResults");
    const currentUnits: Record<number, string> = {};

    getValues().hydrotestResults.forEach((element, index) => {
      currentUnits[index] = getHydrotestParameterUnits(element.parameterId, codelists.data);
    });

    setUnits(currentUnits);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [getValues().hydrotestResults, codelists.data]);

  useEffect(() => {
    const currentValues = getValues();
    if (currentValues?.testKindId?.toString() !== hydrotestKindIds?.toString()) {
      setHydrotestKindIds(currentValues?.testKindId ?? []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, getValues()["testKindId"]]);

  const prepareFormDataForSubmit = (data: Hydrotest): Hydrotest => {
    data = prepareCasingDataForSubmit(data);
    data = prepareObservationDataForSubmit(data, parentId);
    data.type = ObservationType.hydrotest;

    if (Array.isArray(data.testKindId)) {
      data.kindCodelistIds = data.testKindId;
    }
    if (Array.isArray(data.flowDirectionId)) {
      data.flowDirectionCodelistIds = data.flowDirectionId;
    }
    if (Array.isArray(data.evaluationMethodId)) {
      data.evaluationMethodCodelistIds = data.evaluationMethodId;
    }

    if (data.hydrotestResults) {
      data.hydrotestResults = data.hydrotestResults.map(r => {
        return {
          id: r.id,
          parameterId: r.parameterId,
          value: parseFloatWithThousandsSeparator(r.value?.toString()),
          minValue: parseFloatWithThousandsSeparator(r.minValue?.toString()),
          maxValue: parseFloatWithThousandsSeparator(r.maxValue?.toString()),
        };
      });
    }

    delete data.testKindId;
    delete data.flowDirectionId;
    delete data.evaluationMethodId;
    return data;
  };

  const hasTestKindError = !!formState.errors?.testKindId;
  const hasValidFlowDirectionData =
    (
      filteredTestKindDomains.data?.filter(
        (d: Codelist) => d.schema === hydrogeologySchemaConstants.hydrotestFlowDirection,
      ) ?? []
    ).length > 0;

  const hasValidEvaluationMethodData =
    (
      filteredTestKindDomains.data?.filter(
        (d: Codelist) => d.schema === hydrogeologySchemaConstants.hydrotestEvaluationMethod,
      ) ?? []
    ).length > 0;

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={handleSubmit(submitForm)}>
        <FormContainer>
          <ObservationInput observation={item} />
          <FormContainer direction="row">
            <FormDomainMultiSelect
              fieldName="testKindId"
              label="hydrotestKind"
              tooltipLabel="hydrotestResultsWillBeDeleted"
              required={true}
              selected={item?.kindCodelists?.map(c => c.id) || []}
              schemaName={hydrogeologySchemaConstants.hydrotestKind}
            />
            <FormDomainMultiSelect
              fieldName="flowDirectionId"
              label="flowDirection"
              selected={item?.flowDirectionCodelists?.map(c => c.id) || []}
              disabled={hasTestKindError || !hasValidFlowDirectionData}
              schemaName={hydrogeologySchemaConstants.hydrotestFlowDirection}
              prefilteredDomains={filteredTestKindDomains?.data}
            />
          </FormContainer>
          <FormContainer width={"50%"}>
            <FormDomainMultiSelect
              fieldName="evaluationMethodId"
              label="evaluationMethod"
              selected={item?.evaluationMethodCodelists?.map(c => c.id) || []}
              disabled={hasTestKindError || !hasValidEvaluationMethodData}
              schemaName={hydrogeologySchemaConstants.hydrotestEvaluationMethod}
              prefilteredDomains={filteredTestKindDomains?.data}
            />
          </FormContainer>
          {(getValues().testKindId ?? []).length > 0 && (
            <Box
              sx={{
                paddingBottom: "8.5px",
                marginRight: "8px !important",
                marginTop: "18px !important",
              }}>
              <FormContainer direction={"row"} justifyContent={"space-between"}>
                <Typography sx={{ mr: 1, mt: 2, fontWeight: "bold" }}>{t("hydrotestResult")}</Typography>
                <AddButton
                  label="addHydrotestResult"
                  onClick={() => {
                    append({ parameterId: null, value: null, minValue: null, maxValue: null }, { shouldFocus: false });
                  }}
                />
              </FormContainer>
              {fields.map((field, index) => (
                <FormContainer direction={"row"} key={field.id} marginTop="8px" data-cy={`hydrotestResult-${index}`}>
                  <FormDomainSelect
                    fieldName={`hydrotestResults.${index}.parameterId`}
                    label="parameter"
                    selected={field.parameterId}
                    required={true}
                    schemaName={hydrogeologySchemaConstants.hydrotestResultParameter}
                    prefilteredDomains={filteredTestKindDomains?.data}
                    onUpdate={value => {
                      setUnits({ ...units, [index]: getHydrotestParameterUnits(value as number, codelists.data) });
                    }}
                  />
                  <FormInput
                    fieldName={`hydrotestResults.${index}.value`}
                    label="value"
                    value={field.value}
                    withThousandSeparator={true}
                    inputProps={{
                      endAdornment: <InputAdornment position="end">{units[index] ? units[index] : ""}</InputAdornment>,
                    }}
                  />
                  <FormInput
                    fieldName={`hydrotestResults.${index}.minValue`}
                    label="minValue"
                    value={field.minValue}
                    withThousandSeparator={true}
                    inputProps={{
                      endAdornment: <InputAdornment position="end">{units[index] ? units[index] : ""}</InputAdornment>,
                    }}
                  />
                  <FormInput
                    fieldName={`hydrotestResults.${index}.maxValue`}
                    label="maxValue"
                    value={field.maxValue}
                    withThousandSeparator={true}
                    inputProps={{
                      endAdornment: <InputAdornment position="end">{units[index] ? units[index] : ""}</InputAdornment>,
                    }}
                  />
                  <IconButton onClick={() => remove(index)} color="error">
                    <Delete />
                  </IconButton>
                </FormContainer>
              ))}
            </Box>
          )}
        </FormContainer>
        <DataCardSaveAndCancelButtons formMethods={formMethods} submitForm={submitForm} />
      </form>
    </FormProvider>
  );
};
