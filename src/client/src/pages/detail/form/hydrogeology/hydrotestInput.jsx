import { useContext, useEffect, useState } from "react";
import { FormProvider, useFieldArray, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import Delete from "@mui/icons-material/Delete";
import { Box, IconButton, InputAdornment, Typography } from "@mui/material";
import { addHydrotest, updateHydrotest, useDomains, useHydrotestDomains } from "../../../../api/fetchApiV2";
import { AddButton, CancelButton, SaveButton } from "../../../../components/buttons/buttons.tsx";
import { DataCardButtonContainer } from "../../../../components/dataCard/dataCard";
import { DataCardContext, DataCardSwitchContext } from "../../../../components/dataCard/dataCardContext";
import { FormContainer, FormInput, FormMultiSelect, FormSelect, FormValueType } from "../../../../components/form/form";
import { PromptContext } from "../../../../components/prompt/promptContext.tsx";
import { prepareCasingDataForSubmit } from "../completion/casingUtils.jsx";
import { hydrogeologySchemaConstants } from "./hydrogeologySchemaConstants";
import ObservationInput from "./observationInput";
import { ObservationType } from "./observationType";
import { getHydrotestParameterUnits } from "./parameterUnits";

const HydrotestInput = props => {
  const { item, parentId } = props;
  const { triggerReload, selectCard } = useContext(DataCardContext);
  const { checkIsDirty, leaveInput } = useContext(DataCardSwitchContext);
  const { showPrompt } = useContext(PromptContext);
  const domains = useDomains();
  const { t, i18n } = useTranslation();
  const formMethods = useForm({
    mode: "all",
    defaultValues: {
      hydrotestResults: item?.hydrotestResults || [],
    },
  });
  const { fields, append, remove } = useFieldArray({
    name: "hydrotestResults",
    control: formMethods.control,
  });
  const [units, setUnits] = useState({});

  const [hydrotestKindIds, setHydrotestKindIds] = useState(item?.kindCodelists?.map(c => c.id) || []);
  const filteredTestKindDomains = useHydrotestDomains(hydrotestKindIds);

  useEffect(() => {
    if (checkIsDirty) {
      if (Object.keys(formMethods.formState.dirtyFields).length > 0) {
        showPrompt(t("unsavedChangesMessage", { where: t("hydrotest") }), [
          {
            label: t("cancel"),
            action: () => {
              leaveInput(false);
            },
          },
          {
            label: t("reset"),
            action: () => {
              formMethods.reset();
              selectCard(null);
              leaveInput(true);
            },
          },
          {
            label: t("save"),
            disabled: !formMethods.formState.isValid,
            action: () => {
              formMethods.handleSubmit(submitForm)();
            },
          },
        ]);
      } else {
        leaveInput(true);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkIsDirty]);

  // trigger form validation on mount
  useEffect(() => {
    formMethods.trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMethods.trigger]);

  const getFilteredDomains = (schema, data) => data?.filter(c => c.schema === schema).map(c => c.id);

  const getCompatibleValues = (allowedIds, formValues) => formValues?.filter(c => allowedIds?.includes(c)) || [];

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
        const compatibleFlowDirections = getCompatibleValues(allowedFlowDirectionIds, formValues.flowDirectionId);

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
    formMethods.trigger("hydrotestResults");
    var currentUnits = {};
    formMethods.getValues()["hydrotestResults"].forEach((element, index) => {
      currentUnits = {
        ...currentUnits,
        [index]: getHydrotestParameterUnits(element.parameterId, domains.data),
      };
    });
    setUnits(currentUnits);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMethods.getValues()["hydrotestResults"]]);

  useEffect(() => {
    var currentValues = formMethods.getValues();
    if (currentValues?.testKindId?.toString() !== hydrotestKindIds?.toString()) {
      setHydrotestKindIds(currentValues?.testKindId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [item, formMethods.getValues()["testKindId"]]);

  const prepareFormDataForSubmit = data => {
    data = prepareCasingDataForSubmit(data);
    data?.startTime ? (data.startTime += ":00.000Z") : (data.startTime = null);
    data?.endTime ? (data.endTime += ":00.000Z") : (data.endTime = null);
    data.type = ObservationType.fieldMeasurement;
    data.boreholeId = parentId;

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
          value: r.value,
          minValue: r.minValue,
          maxValue: r.maxValue,
        };
      });
    }

    if (data.reliabilityId === "") {
      data.reliabilityId = null;
    }

    delete data.testKindId;
    delete data.flowDirectionId;
    delete data.evaluationMethodId;
    delete data.reliability;
    return data;
  };

  const submitForm = data => {
    data = prepareFormDataForSubmit(data);

    if (item.id === 0) {
      addHydrotest({
        ...data,
      }).then(() => {
        triggerReload();
      });
    } else {
      updateHydrotest({
        ...item,
        ...data,
      }).then(() => {
        triggerReload();
      });
    }
  };

  return (
    <>
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(submitForm)}>
          <FormContainer>
            <ObservationInput observation={item} boreholeId={parentId} />
            <FormContainer direction="row">
              <FormMultiSelect
                fieldName="testKindId"
                label="hydrotestKind"
                tooltipLabel="hydrotestResultsWillBeDeleted"
                required={true}
                selected={item?.kindCodelists?.map(c => c.id) || []}
                values={domains?.data
                  ?.filter(d => d.schema === hydrogeologySchemaConstants.hydrotestKind)
                  .sort((a, b) => a.order - b.order)
                  .map(d => ({
                    key: d.id,
                    name: d[i18n.language],
                  }))}
              />
              <FormMultiSelect
                fieldName="flowDirectionId"
                label="flowDirection"
                selected={item?.flowDirectionCodelists?.map(c => c.id) || []}
                disabled={
                  !!formMethods.formState.errors?.testKindId ||
                  !filteredTestKindDomains?.data?.filter(
                    d => d.schema === hydrogeologySchemaConstants.hydrotestFlowDirection,
                  ).length > 0
                }
                values={filteredTestKindDomains?.data
                  ?.filter(d => d.schema === hydrogeologySchemaConstants.hydrotestFlowDirection)
                  .sort((a, b) => a.order - b.order)
                  .map(d => ({
                    key: d.id,
                    name: d[i18n.language],
                  }))}
              />
            </FormContainer>
            <FormContainer width={"50%"}>
              <FormMultiSelect
                fieldName="evaluationMethodId"
                label="evaluationMethod"
                selected={item?.evaluationMethodCodelists?.map(c => c.id) || []}
                disabled={
                  !!formMethods.formState.errors?.testKindId ||
                  !filteredTestKindDomains?.data?.filter(
                    d => d.schema === hydrogeologySchemaConstants.hydrotestEvaluationMethod,
                  ).length > 0
                }
                values={filteredTestKindDomains?.data
                  ?.filter(d => d.schema === hydrogeologySchemaConstants.hydrotestEvaluationMethod)
                  .sort((a, b) => a.order - b.order)
                  .map(d => ({
                    key: d.id,
                    name: d[i18n.language],
                  }))}
              />
            </FormContainer>
            {formMethods.getValues().testKindId?.length > 0 && (
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
                      append({ parameterId: "", value: null, minValue: null, maxValue: null }, { shouldFocus: false });
                    }}
                  />
                </FormContainer>
                {fields.map((field, index) => (
                  <FormContainer direction={"row"} key={field.id} marginTop="8px" data-cy={`hydrotestResult-${index}`}>
                    <FormSelect
                      fieldName={`hydrotestResults.${index}.parameterId`}
                      label="parameter"
                      selected={field.parameterId}
                      required={true}
                      values={filteredTestKindDomains?.data
                        ?.filter(d => d.schema === hydrogeologySchemaConstants.hydrotestResultParameter)
                        .sort((a, b) => a.order - b.order)
                        .map(d => ({
                          key: d.id,
                          name: d[i18n.language],
                        }))}
                      onUpdate={value => {
                        setUnits({ ...units, [index]: getHydrotestParameterUnits(value, domains.data) });
                      }}
                    />
                    <FormInput
                      fieldName={`hydrotestResults.${index}.value`}
                      label="value"
                      value={field.value}
                      type={FormValueType.Number}
                      inputProps={{
                        endAdornment: (
                          <InputAdornment position="end">{units[index] ? units[index] : ""}</InputAdornment>
                        ),
                      }}
                    />
                    <FormInput
                      fieldName={`hydrotestResults.${index}.minValue`}
                      label="minValue"
                      value={field.minValue}
                      type={FormValueType.Number}
                      inputProps={{
                        endAdornment: (
                          <InputAdornment position="end">{units[index] ? units[index] : ""}</InputAdornment>
                        ),
                      }}
                    />
                    <FormInput
                      fieldName={`hydrotestResults.${index}.maxValue`}
                      label="maxValue"
                      value={field.maxValue}
                      type={FormValueType.Number}
                      inputProps={{
                        endAdornment: (
                          <InputAdornment position="end">{units[index] ? units[index] : ""}</InputAdornment>
                        ),
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
          <DataCardButtonContainer>
            <CancelButton
              onClick={() => {
                formMethods.reset();
                selectCard(null);
              }}
            />
            <SaveButton
              disabled={!formMethods.formState.isValid}
              onClick={() => {
                formMethods.handleSubmit(submitForm)();
              }}
            />
          </DataCardButtonContainer>
        </form>
      </FormProvider>
    </>
  );
};

export default HydrotestInput;
