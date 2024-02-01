import React, { useEffect, useContext, useState } from "react";
import { useForm, FormProvider } from "react-hook-form";
import {
  Box,
  Card,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { FormMultiSelect } from "../../../../components/form/formMultiSelect";
import ObservationInput from "./observationInput";
import HydrotestResultTable from "./hydrotestResultTable";
import CheckIcon from "@mui/icons-material/Check";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { useTranslation } from "react-i18next";
import { useHydrotestDomains, useDomains } from "../../../../api/fetchApiV2";
import { AlertContext } from "../../../../components/alert/alertContext";
import { ObservationType } from "./observationType";
import { hydrogeologySchemaConstants } from "./hydrogeologySchemaConstants";

const HydrotestInput = ({
  hydrotest,
  setSelectedHydrotest,
  boreholeId,
  addHydrotest,
  updateHydrotest,
  setAddedHydrotestFromResultTable,
}) => {
  const [isAddingHydrotestResult, setIsAddingHydrotestResult] = useState(false);
  const [editingHydrotestResultId, setEditingHydrotestResultId] =
    useState(null);
  const [hydrotestKindIds, setHydrotestKindIds] = useState(
    hydrotest?.codelists
      ?.filter(c => c.schema === hydrogeologySchemaConstants.hydrotestKind)
      .map(c => c.id) || [],
  );
  const domains = useDomains();
  const filteredTestKindDomains = useHydrotestDomains(hydrotestKindIds);
  const { t, i18n } = useTranslation();
  const formMethods = useForm();
  const alertContext = useContext(AlertContext);

  // trigger form validation on mount
  useEffect(() => {
    formMethods.trigger();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formMethods.trigger]);

  const getFilteredDomains = (schema, data) =>
    data?.filter(c => c.schema === schema).map(c => c.id);

  const getCompatibleValues = (allowedIds, formValues) => {
    if (typeof formValues === "string") {
      formValues = formValues.split(",").map(value => parseInt(value, 10));
    }
    return formValues?.filter(c => allowedIds?.includes(c)) || [];
  };

  useEffect(() => {
    const formValues = formMethods.getValues();
    var kindIds = formValues?.testKindId;
    if (typeof kindIds === "string") {
      kindIds = kindIds.split(",").reduce((filtered, id) => {
        if (id !== "") {
          filtered.push(parseInt(id, 10));
        }
        return filtered;
      }, []);
    }
    if (kindIds != null) {
      if (kindIds !== hydrotestKindIds) {
        setHydrotestKindIds(kindIds);
      }
      if (kindIds.length === 0) {
        formMethods.setValue("flowDirectionId", []);
        formMethods.setValue("evaluationMethodId", []);
        deleteHydrotestResults();
      }
    }

    // check the compatibility of codelists (flowdirection, evaluationMethod, hydrotestResultParameter) when the hydrotestKinds (and therefore the filteredTestKindDomains) change.
    if (filteredTestKindDomains.data?.length > 0) {
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

      const compatibleHydrotestParameterIds = getCompatibleValues(
        allowedHydrotestResultParameterIds,
        hydrotest.hydrotestResults?.map(h => h.parameterId),
      );

      if (!(hydrotest?.hydrotestResults?.length > 0)) return;
      const filteredHydrotestResults = hydrotest.hydrotestResults
        .filter(h => compatibleHydrotestParameterIds.includes(h.parameterId))
        .map(r => {
          delete r.parameter;
          return r;
        });

      if (filteredHydrotestResults.length >= hydrotest.hydrotestResults.length)
        return;

      updateHydrotest({
        ...hydrotest,
        codelistIds:
          hydrotest?.codelists?.length > 0
            ? [...hydrotest?.codelists?.map(c => c.id)]
            : [],
        hydrotestResults: filteredHydrotestResults,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    filteredTestKindDomains,
    formMethods.getValues,
    hydrotest,
    formMethods.setValue,
    updateHydrotest,
  ]);

  const closeFormIfCompleted = () => {
    const formValues = formMethods.getValues();
    if (
      !formValues.reliabilityId ||
      !formValues.startTime ||
      formValues.testKindId?.length < 1
    ) {
      alertContext.error(t("hydrotestRequiredFieldsAlert"));
    } else {
      if (editingHydrotestResultId) {
        alertContext.error(t("saveHydrotestResultAlert"));
      } else {
        formMethods.handleSubmit(submitForm)();
        setSelectedHydrotest(null);
      }
    }
  };

  const convertDateToIsoString = dateTime =>
    dateTime ? dateTime + ":00.000Z" : null;

  const prepareFormDataForSubmit = data => {
    data.startTime = convertDateToIsoString(data?.startTime);
    data.endTime = convertDateToIsoString(data?.endTime);

    // add codelists
    data.codelistIds = [
      ...data.flowDirectionId,
      ...data.evaluationMethodId,
      ...data.testKindId,
    ];

    delete data.flowDirectionId;
    delete data.evaluationMethodId;
    delete data.testKindId;
    return data;
  };

  const submitForm = data => {
    data = prepareFormDataForSubmit(data);
    const hydrotestResults =
      hydrotest.hydrotestResults?.map(h => {
        delete h.hydrotestId;
        delete h.parameter;
        return h;
      }) || [];

    if (data.startTime && data.reliabilityId) {
      if (hydrotest.id === 0) {
        addHydrotest({
          ...data,
          type: ObservationType.hydrotest,
          boreholeId: boreholeId,
          hydrotestResults: hydrotestResults,
        });
      } else {
        delete hydrotest.casing;
        delete hydrotest.reliability;
        updateHydrotest({
          ...hydrotest,
          ...data,
        });
      }
    } else {
      setSelectedHydrotest(null);
    }
  };

  const deleteHydrotestResults = () => {
    if (hydrotest?.hydrotestResults?.length > 0) {
      updateHydrotest({
        ...hydrotest,
        codelistIds: [...hydrotest.codelistIds, ...hydrotestKindIds],
        hydrotestResults: [],
      });
    }
  };

  const canAddHydrotestResults =
    formMethods.formState.isValid &&
    !isAddingHydrotestResult &&
    !editingHydrotestResultId &&
    filteredTestKindDomains?.data?.length !== 0;

  return (
    <Card
      sx={{
        border: "1px solid lightgrey",
        borderRadius: "3px",
        p: 1.5,
        mb: 2,
        height: "100%",
      }}>
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(submitForm)}>
          <Stack direction="row" sx={{ width: "100%" }}>
            <Stack direction="column" sx={{ width: "100%" }} spacing={1}>
              <Typography sx={{ mr: 1, mt: 2, fontWeight: "bold" }}>
                {t("hydrotest")}
              </Typography>
              <ObservationInput
                observation={hydrotest}
                boreholeId={boreholeId}
              />
              <Stack direction="row">
                <FormMultiSelect
                  fieldName="testKindId"
                  label="hydrotestKind"
                  required={true}
                  selected={
                    hydrotest?.codelists
                      ?.filter(
                        c =>
                          c.schema ===
                          hydrogeologySchemaConstants.hydrotestKind,
                      )
                      .map(c => c.id) || []
                  }
                  values={domains?.data
                    ?.filter(
                      d =>
                        d.schema === hydrogeologySchemaConstants.hydrotestKind,
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
                    hydrotest?.codelists
                      ?.filter(
                        c =>
                          c.schema ===
                          hydrogeologySchemaConstants.hydrotestFlowDirection,
                      )
                      .map(c => c.id) || []
                  }
                  disabled={
                    !!formMethods.formState.errors.testKindId ||
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
              <Stack direction="row">
                <FormMultiSelect
                  fieldName="evaluationMethodId"
                  label="evaluationMethod"
                  selected={
                    hydrotest?.codelists
                      ?.filter(
                        c =>
                          c.schema ===
                          hydrogeologySchemaConstants.hydrotestEvaluationMethod,
                      )
                      .map(c => c.id) || []
                  }
                  disabled={
                    !!formMethods.formState.errors.testKindId ||
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
                <div style={{ flex: "1", marginRight: "10px" }}></div>
              </Stack>
              <Stack direction="row" sx={{ paddingTop: "20px" }}>
                <Typography sx={{ mr: 1, mt: 2, fontWeight: "bold" }}>
                  {t("hydrotestResult")}
                </Typography>
                <Tooltip title={t("add")}>
                  <IconButton disabled={!canAddHydrotestResults} sx={{ p: 0 }}>
                    <AddCircleIcon
                      sx={{
                        color: canAddHydrotestResults ? "black" : "disabled",
                      }}
                      data-cy="add-hydrotestresult-button"
                      onClick={e => {
                        formMethods.formState.isValid &&
                          setIsAddingHydrotestResult(true);
                        !formMethods.formState.isValid &&
                          alertContext.error(t("hydrotestRequiredFieldsAlert"));
                      }}
                    />
                  </IconButton>
                </Tooltip>
              </Stack>
              <HydrotestResultTable
                hydrotest={hydrotest}
                isEditable={true}
                isAddingHydrotestResult={isAddingHydrotestResult}
                setIsAddingHydrotestResult={setIsAddingHydrotestResult}
                updateHydrotest={updateHydrotest}
                handleSubmit={formMethods.handleSubmit}
                submitForm={submitForm}
                setAddedHydrotestFromResultTable={
                  setAddedHydrotestFromResultTable
                }
                hydrotestKindIds={hydrotestKindIds}
                filteredTestKindDomains={filteredTestKindDomains}
                editingId={editingHydrotestResultId}
                setEditingId={setEditingHydrotestResultId}
              />
            </Stack>
            <Box sx={{ marginLeft: "auto" }}>
              <Tooltip title={t("save")}>
                <CheckIcon
                  sx={{
                    color:
                      formMethods.formState.isValid && !editingHydrotestResultId
                        ? "#0080008c"
                        : "disabled",
                  }}
                  data-cy="save-icon"
                  onClick={() => closeFormIfCompleted()}
                />
              </Tooltip>
            </Box>
          </Stack>
        </form>
      </FormProvider>
    </Card>
  );
};

export default React.memo(HydrotestInput);
