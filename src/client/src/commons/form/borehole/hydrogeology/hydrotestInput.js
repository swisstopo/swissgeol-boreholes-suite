import React, { useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import {
  Box,
  IconButton,
  InputAdornment,
  Stack,
  Typography,
} from "@mui/material";
import {
  FormInput,
  FormMultiSelect,
  FormSelect,
} from "../../../../components/form/form";
import { StackHalfWidth } from "../../../../components/baseComponents";
import { DataCardButtonContainer } from "../../../../components/dataCard/dataCard";
import {
  AddButton,
  CancelButton,
  SaveButton,
} from "../../../../components/buttons/buttons";
import ObservationInput from "./observationInput";
import { useTranslation } from "react-i18next";
import { useHydrotestDomains, useDomains } from "../../../../api/fetchApiV2";
import { ObservationType } from "./observationType";
import { hydrogeologySchemaConstants } from "./hydrogeologySchemaConstants";
import { TestResultParameterUnits } from "./parameterUnits";
import Delete from "@mui/icons-material/Delete";

const HydrotestInput = props => {
  const { item, setSelected, parentId, addData, updateData } = props;
  const domains = useDomains();
  const { t, i18n } = useTranslation();
  const formMethods = useForm({
    defaultValues: {
      hydrotestResults: item?.hydrotestResults || [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    name: "hydrotestResults",
    control: formMethods.control,
  });
  const [units, setUnits] = useState({});

  const [hydrotestKindIds, setHydrotestKindIds] = useState(
    item?.codelists
      ?.filter(c => c.schema === hydrogeologySchemaConstants.hydrotestKind)
      .map(c => c.id) || [],
  );
  const filteredTestKindDomains = useHydrotestDomains(hydrotestKindIds);

  // trigger form validation on mount
  useEffect(() => {
    formMethods.trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMethods.trigger]);

  const getFilteredDomains = (schema, data) =>
    data?.filter(c => c.schema === schema).map(c => c.id);

  const getCompatibleValues = (allowedIds, formValues) =>
    formValues?.filter(c => allowedIds?.includes(c)) || [];

  useEffect(() => {
    if (hydrotestKindIds.length > 0) {
      // check the compatibility of codelists (flowdirection, evaluationMethod, hydrotestResultParameter) when the hydrotestKinds (and therefore the filteredTestKindDomains) change.
      if (filteredTestKindDomains.data?.length > 0) {
        const formValues = formMethods.getValues();

        // delete flowDirections, evaluationMethods that are not longer compatible with the selected hydrotestKinds.
        const allowedEvalutationMethodId = getFilteredDomains(
          hydrogeologySchemaConstants.hydrotestEvaluationMethod,
          filteredTestKindDomains.data,
        );
        const allowedFlowDirectionIds = getFilteredDomains(
          hydrogeologySchemaConstants.hydrotestFlowDirection,
          filteredTestKindDomains.data,
        );

        const compatibleEvaluationMethods = getCompatibleValues(
          allowedEvalutationMethodId,
          formValues.evaluationMethodId,
        );
        const compatibleFlowDirections = getCompatibleValues(
          allowedFlowDirectionIds,
          formValues.flowDirectionId,
        );

        // set form values
        formMethods.setValue("evaluationMethodId", compatibleEvaluationMethods);
        formMethods.setValue("flowDirectionId", compatibleFlowDirections);

        // delete hydrotestResults that are not longer compatible with the selected hydrotestKinds.
        const allowedHydrotestResultParameterIds = getFilteredDomains(
          hydrogeologySchemaConstants.hydrotestResultParameter,
          filteredTestKindDomains.data,
        );

        const compatibleHydrotestResults = formValues.hydrotestResults?.filter(
          r => allowedHydrotestResultParameterIds.includes(r.parameterId) || [],
        );

        formMethods.setValue("hydrotestResults", compatibleHydrotestResults);
      }
    } else {
      formMethods.setValue("flowDirectionId", []);
      formMethods.setValue("evaluationMethodId", []);
      formMethods.setValue("hydrotestResults", []);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrotestKindIds]);

  useEffect(() => {
    var currentUnits = {};
    formMethods.getValues()["hydrotestResults"].forEach((element, index) => {
      currentUnits = {
        ...currentUnits,
        [index]: getParameterUnit(element.parameterId),
      };
    });
    setUnits(currentUnits);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMethods.getValues()["hydrotestResults"]]);

  useEffect(() => {
    var currentValues = formMethods.getValues();
    if (
      currentValues?.testKindId?.toString() !== hydrotestKindIds?.toString()
    ) {
      setHydrotestKindIds(currentValues?.testKindId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, formMethods.getValues()["testKindId"]]);

  const prepareFormDataForSubmit = data => {
    data?.startTime ? (data.startTime += ":00.000Z") : (data.startTime = null);
    data?.endTime ? (data.endTime += ":00.000Z") : (data.endTime = null);
    data.type = ObservationType.fieldMeasurement;
    data.boreholeId = parentId;

    data.codelistIds = [];
    if (Array.isArray(data.testKindId)) {
      data.codelistIds = [...data.codelistIds, ...data.testKindId];
    }
    if (Array.isArray(data.flowDirectionId)) {
      data.codelistIds = [...data.codelistIds, ...data.flowDirectionId];
    }
    if (Array.isArray(data.evaluationMethodId)) {
      data.codelistIds = [...data.codelistIds, ...data.evaluationMethodId];
    }

    if (data.casingId == null) {
      data.casingId = item.casingId;
    }

    delete data.testKindId;
    delete data.flowDirectionId;
    delete data.evaluationMethodId;
    return data;
  };

  const submitForm = data => {
    data = prepareFormDataForSubmit(data);
    if (item.id === 0) {
      addData({
        ...data,
      });
    } else {
      updateData({
        ...item,
        ...data,
      });
    }
  };

  const closeFormIfCompleted = () => {
    if (formMethods.formState.isValid) {
      formMethods.handleSubmit(submitForm)();
      setSelected(null);
    }
  };

  const getParameterUnit = parameterId => {
    if (!parameterId) {
      return null;
    }
    return TestResultParameterUnits[
      domains?.data?.find(d => d.id === parameterId).geolcode
    ];
  };

  return (
    <FormProvider {...formMethods}>
      <form onSubmit={formMethods.handleSubmit(submitForm)}>
        <Stack direction="column" sx={{ width: "100%" }} spacing={1}>
          <ObservationInput observation={item} boreholeId={parentId} />
          <Stack direction="row">
            <FormMultiSelect
              fieldName="testKindId"
              label="hydrotestKind"
              tooltipLabel="hydrotestResultsWillBeDeleted"
              required={true}
              selected={
                item?.codelists
                  ?.filter(
                    c => c.schema === hydrogeologySchemaConstants.hydrotestKind,
                  )
                  .map(c => c.id) || []
              }
              values={domains?.data
                ?.filter(
                  d => d.schema === hydrogeologySchemaConstants.hydrotestKind,
                )
                .sort((a, b) => a.order - b.order)
                .map(d => ({
                  key: d.id,
                  name: d[i18n.language],
                }))}
            />
            <FormMultiSelect
              fieldName="flowDirectionId"
              label="flowDirection"
              selected={
                item?.codelists
                  ?.filter(
                    c =>
                      c.schema ===
                      hydrogeologySchemaConstants.hydrotestFlowDirection,
                  )
                  .map(c => c.id) || []
              }
              disabled={
                !!formMethods.formState.errors?.testKindId ||
                !filteredTestKindDomains?.data?.filter(
                  d =>
                    d.schema ===
                    hydrogeologySchemaConstants.hydrotestFlowDirection,
                ).length > 0
              }
              values={filteredTestKindDomains?.data
                ?.filter(
                  d =>
                    d.schema ===
                    hydrogeologySchemaConstants.hydrotestFlowDirection,
                )
                .sort((a, b) => a.order - b.order)
                .map(d => ({
                  key: d.id,
                  name: d[i18n.language],
                }))}
            />
          </Stack>
          <StackHalfWidth>
            <FormMultiSelect
              fieldName="evaluationMethodId"
              label="evaluationMethod"
              selected={
                item?.codelists
                  ?.filter(
                    c =>
                      c.schema ===
                      hydrogeologySchemaConstants.hydrotestEvaluationMethod,
                  )
                  .map(c => c.id) || []
              }
              disabled={
                !!formMethods.formState.errors?.testKindId ||
                !filteredTestKindDomains?.data?.filter(
                  d =>
                    d.schema ===
                    hydrogeologySchemaConstants.hydrotestEvaluationMethod,
                ).length > 0
              }
              values={filteredTestKindDomains?.data
                ?.filter(
                  d =>
                    d.schema ===
                    hydrogeologySchemaConstants.hydrotestEvaluationMethod,
                )
                .sort((a, b) => a.order - b.order)
                .map(d => ({
                  key: d.id,
                  name: d[i18n.language],
                }))}
            />
          </StackHalfWidth>
          {formMethods.getValues().testKindId?.length > 0 && (
            <Box
              sx={{
                paddingBottom: "8.5px",
                marginRight: "8px !important",
                marginTop: "18px !important",
              }}>
              <Stack
                direction={"row"}
                sx={{ width: "100%" }}
                spacing={1}
                justifyContent={"space-between"}>
                <Typography sx={{ mr: 1, mt: 2, fontWeight: "bold" }}>
                  {t("hydrotestResult")}
                </Typography>
                <AddButton
                  label="addHydrotestResult"
                  onClick={e => {
                    append();
                  }}
                />
              </Stack>
              {fields.map((field, index) => (
                <Stack
                  direction={"row"}
                  key={field.id}
                  marginTop="8px"
                  data-cy={`hydrotestResult-${index}`}>
                  <FormSelect
                    fieldName={`hydrotestResults.${index}.parameterId`}
                    label="parameter"
                    selected={field.parameterId}
                    required={true}
                    values={filteredTestKindDomains?.data
                      ?.filter(
                        d =>
                          d.schema ===
                          hydrogeologySchemaConstants.hydrotestResultParameter,
                      )
                      .sort((a, b) => a.order - b.order)
                      .map(d => ({
                        key: d.id,
                        name: d[i18n.language],
                      }))}
                    onUpdate={value => {
                      setUnits({ ...units, [index]: getParameterUnit(value) });
                    }}
                  />
                  <FormInput
                    fieldName={`hydrotestResults.${index}.value`}
                    label="value"
                    value={field.value}
                    type="number"
                    inputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {units[index] ? units[index] : ""}
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormInput
                    fieldName={`hydrotestResults.${index}.minValue`}
                    label="minValue"
                    value={field.minValue}
                    type="number"
                    inputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {units[index] ? units[index] : ""}
                        </InputAdornment>
                      ),
                    }}
                  />
                  <FormInput
                    fieldName={`hydrotestResults.${index}.maxValue`}
                    label="maxValue"
                    value={field.maxValue}
                    type="number"
                    inputProps={{
                      endAdornment: (
                        <InputAdornment position="end">
                          {units[index] ? units[index] : ""}
                        </InputAdornment>
                      ),
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
                </Stack>
              ))}
            </Box>
          )}
        </Stack>
        <DataCardButtonContainer>
          <CancelButton
            onClick={() => {
              formMethods.reset();
              setSelected(null);
            }}
          />
          <SaveButton
            disabled={!formMethods.formState.isValid}
            onClick={() => {
              closeFormIfCompleted();
            }}
          />
        </DataCardButtonContainer>
      </form>
    </FormProvider>
  );
};

export default React.memo(HydrotestInput);
