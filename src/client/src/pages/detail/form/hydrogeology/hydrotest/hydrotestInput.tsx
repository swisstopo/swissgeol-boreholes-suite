import { FC, useContext, useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Delete from "@mui/icons-material/Delete";
import { Box, IconButton, InputAdornment, Typography } from "@mui/material";
import { useReloadBoreholes } from "../../../../../api/borehole.ts";
import { Codelist, Hydrotest } from "../../../../../api/generated";
import { AddButton } from "../../../../../components/buttons/buttons";
import { useCodelists } from "../../../../../components/codelist.ts";
import { DataCardContext } from "../../../../../components/dataCard/dataCardContext";
import { DataCardSaveAndCancelButtons } from "../../../../../components/dataCard/saveAndCancelButtons.tsx";
import { useUnsavedChangesPrompt } from "../../../../../components/dataCard/useUnsavedChangesPrompt.tsx";
import {
  FormContainer,
  FormDomainMultiSelect,
  FormDomainSelect,
  FormInput,
  FormValueType,
} from "../../../../../components/form/form";
import { parseFloatWithThousandsSeparator } from "../../../../../components/form/formUtils.ts";
import { useFormDirtyMarkAsChanged } from "../../../../../components/form/useFormDirty.tsx";
import { useValidateFormOnMount } from "../../../../../components/form/useValidateFormOnMount.tsx";
import { useResetTabStatus } from "../../../../../hooks/useResetTabStatus.ts";
import { prepareCasingDataForSubmit } from "../../completion/casingUtils";
import { hydrogeologySchemaConstants } from "../hydrogeologySchemaConstants";
import { ObservationType, prepareObservationDataForSubmit } from "../Observation";
import ObservationInput from "../observationInput";
import { getHydrotestParameterUnits } from "../parameterUnits";
import { addHydrotest, HydrotestInputProps, updateHydrotest, useHydrotestDomains } from "./Hydrotest";

interface HydrotestResultFormData {
  id?: number;
  parameterId?: number | null;
  value?: number | null;
  minValue?: number | null;
  maxValue?: number | null;
}

type HydrotestFormData = Omit<Hydrotest, "hydrotestResults"> & {
  testKindId?: number[];
  flowDirectionId?: number[];
  evaluationMethodId?: number[];
  hydrotestResults?: HydrotestResultFormData[] | null;
};

export const HydrotestInput: FC<HydrotestInputProps> = ({ item, parentId }) => {
  const { t } = useTranslation();
  const { triggerReload } = useContext(DataCardContext);
  const resetTabStatus = useResetTabStatus(["hydrotest"]);
  const codelists = useCodelists();
  const reloadBoreholes = useReloadBoreholes();

  const formMethods = useForm<HydrotestFormData>({
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

  const submitForm = (data: HydrotestFormData) => {
    resetTabStatus();
    const hydrotest: Hydrotest = prepareFormDataForSubmit(data);

    if (item.id === 0) {
      // Neither call is awaited: the legacy fetch helper reports API errors itself, and the submit
      // handler returns void.
      void addHydrotest({
        ...hydrotest,
      }).then(() => {
        triggerReload();
        reloadBoreholes();
      });
    } else {
      void updateHydrotest({
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
  useFormDirtyMarkAsChanged({ formState });

  const getFilteredDomains = (schema: string, data: Codelist[]) =>
    data?.filter(c => c.schema === schema).map(c => c.id) || [];

  const getCompatibleValues = (allowedIds: number[], formValues: number[]) =>
    formValues?.filter(c => allowedIds.includes(c)) || [];

  useEffect(() => {
    if (hydrotestKindIds.length > 0) {
      // check the compatibility of codelists (flowdirection, evaluationMethod, hydrotestResultParameter) when the hydrotestKinds (and therefore the filteredTestKindDomains) change.
      const testKindDomains = filteredTestKindDomains.data;
      if (testKindDomains && testKindDomains.length > 0) {
        const formValues = getValues();
        // delete flowDirections, evaluationMethods that are no longer compatible with the selected hydrotestKinds.
        const allowedEvaluationMethodIds = getFilteredDomains(
          hydrogeologySchemaConstants.hydrotestEvaluationMethod,
          testKindDomains,
        );
        const allowedFlowDirectionIds = getFilteredDomains(
          hydrogeologySchemaConstants.hydrotestFlowDirection,
          testKindDomains,
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
          testKindDomains,
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
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrotestKindIds]);

  useEffect(() => {
    // Not awaited: effects cannot be async, and the validation result is read from form state.
    void trigger("hydrotestResults");
    const currentUnits: Record<number, string> = {};

    getValues().hydrotestResults?.forEach((element, index) => {
      currentUnits[index] = getHydrotestParameterUnits(element.parameterId, codelists.data);
    });

    setUnits(currentUnits);
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [getValues().hydrotestResults, codelists.data]);

  useEffect(() => {
    const currentValues = getValues();
    if (currentValues?.testKindId?.toString() !== hydrotestKindIds?.toString()) {
      setHydrotestKindIds(currentValues?.testKindId ?? []);
    }
    // oxlint-disable-next-line react-hooks/exhaustive-deps
  }, [item, getValues()["testKindId"]]);

  const prepareFormDataForSubmit = (data: HydrotestFormData): Hydrotest => {
    let prepared: Hydrotest = prepareCasingDataForSubmit(data) as Hydrotest;
    prepared = prepareObservationDataForSubmit(prepared, parentId);
    prepared.type = ObservationType.hydrotest;

    prepared.kindCodelistIds = Array.isArray(data.testKindId) ? data.testKindId : [];
    prepared.flowDirectionCodelistIds = Array.isArray(data.flowDirectionId) ? data.flowDirectionId : [];
    prepared.evaluationMethodCodelistIds = Array.isArray(data.evaluationMethodId) ? data.evaluationMethodId : [];

    if (data.hydrotestResults) {
      prepared.hydrotestResults = data.hydrotestResults.map(r => ({
        id: r.id ?? 0,
        parameterId: r.parameterId ?? 0,
        hydrotestId: 0,
        value: parseFloatWithThousandsSeparator(r.value?.toString()),
        minValue: parseFloatWithThousandsSeparator(r.minValue?.toString()),
        maxValue: parseFloatWithThousandsSeparator(r.maxValue?.toString()),
      }));
    }

    return prepared;
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
      <form onSubmit={event => void handleSubmit(submitForm)(event)}>
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
                    append(
                      { parameterId: undefined, value: undefined, minValue: undefined, maxValue: undefined },
                      { shouldFocus: false },
                    );
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
                    type={FormValueType.Number}
                    inputProps={{
                      endAdornment: <InputAdornment position="end">{units[index] ? units[index] : ""}</InputAdornment>,
                    }}
                  />
                  <FormInput
                    fieldName={`hydrotestResults.${index}.minValue`}
                    label="minValue"
                    value={field.minValue}
                    type={FormValueType.Number}
                    inputProps={{
                      endAdornment: <InputAdornment position="end">{units[index] ? units[index] : ""}</InputAdornment>,
                    }}
                  />
                  <FormInput
                    fieldName={`hydrotestResults.${index}.maxValue`}
                    label="maxValue"
                    value={field.maxValue}
                    type={FormValueType.Number}
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
