import React, { useEffect, useContext, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Card,
  Chip,
  FormControl,
  IconButton,
  MenuItem,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import ObservationInput from "./observationInput";
import HydrotestResultTable from "./hydrotestResultTable";
import CheckIcon from "@mui/icons-material/Check";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import CancelIcon from "@mui/icons-material/Cancel";
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
  const {
    handleSubmit,
    register,
    control,
    formState,
    getValues,
    setValue,
    trigger,
  } = useForm();
  const alertContext = useContext(AlertContext);

  // trigger form validation on mount
  useEffect(() => {
    trigger();
  }, [trigger]);

  const getFilteredDomains = (schema, data) =>
    data?.filter(c => c.schema === schema).map(c => c.id);

  const getCompatibleValues = (allowedIds, formValues) =>
    formValues?.filter(c => allowedIds?.includes(c)) || [];

  useEffect(() => {
    // check the compatibility of codelists (flowdirection, evaluationMethod, hydrotestResultParameter) when the hydrotestKinds (and therefore the filteredTestKindDomains) change.
    if (filteredTestKindDomains.data?.length > 0) {
      const formValues = getValues();
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
      setValue("evaluationMethodId", compatibleEvaluationMethods);
      setValue("flowDirectionId", compatibleFlowDirections);

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
  }, [
    filteredTestKindDomains,
    getValues,
    hydrotest,
    setValue,
    updateHydrotest,
  ]);

  const closeFormIfCompleted = () => {
    const formValues = getValues();
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
        handleSubmit(submitForm)();
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

  const resetRelatedFormValues = () => {
    setValue("flowDirectionId", []);
    setValue("evaluationMethodId", []);
    deleteHydrotestResults();
  };

  const handleDeleteHover = field => {
    if (
      field.name === "testKindId" &&
      hydrotest?.hydrotestResults?.length > 0
    ) {
      alertContext.error(t("hydrotestResultsWillBeDeleted"));
    }
  };

  const ChipBox = (selection, field) => {
    const handleDelete = valueToDelete => {
      const updatedValues = field.value.filter(
        value => value !== valueToDelete,
      );
      field.onChange(updatedValues);
      setHydrotestKindIds(updatedValues);

      if (updatedValues.length === 0) {
        resetRelatedFormValues();
        trigger();
      }
    };
    return (
      <Box
        sx={{
          display: "flex",
          flexWrap: "wrap",
          gap: 0.5,
        }}>
        {selection.map(selectedValue => {
          const selectedOption = domains?.data?.find(
            option => option.id === selectedValue,
          );
          return (
            <Chip
              key={selectedValue}
              label={
                selectedOption ? selectedOption[i18n.language] : selectedValue
              }
              deleteIcon={
                <CancelIcon
                  onMouseDown={e => e.stopPropagation()}
                  onMouseOver={() => handleDeleteHover(field)}
                />
              }
              onClick={e => e.stopPropagation()}
              onDelete={e => {
                e.stopPropagation();
                handleDelete(selectedValue);
              }}
            />
          );
        })}
      </Box>
    );
  };

  const canAddHydrotestResults =
    formState.isValid &&
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
      <form onSubmit={handleSubmit(submitForm)}>
        <Stack direction="row" sx={{ width: "100%" }}>
          <Stack direction="column" sx={{ width: "100%" }} spacing={1}>
            <Typography sx={{ mr: 1, mt: 2, fontWeight: "bold" }}>
              {t("hydrotest")}
            </Typography>
            <ObservationInput
              observation={hydrotest}
              boreholeId={boreholeId}
              register={register}
              control={control}
              formState={formState}
              trigger={trigger}
            />
            <Stack direction="row" sx={{ paddingTop: "10px" }}>
              <FormControl
                variant="outlined"
                sx={{ flex: "1", marginRight: "10px" }}>
                <Controller
                  name="testKindId"
                  control={control}
                  defaultValue={
                    hydrotest?.codelists
                      ?.filter(
                        c =>
                          c.schema ===
                          hydrogeologySchemaConstants.hydrotestKind,
                      )
                      .map(c => c.id) || []
                  }
                  rules={{ required: true }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      size="small"
                      label={t("hydrotestKind")}
                      variant="outlined"
                      value={field.value || ""}
                      data-cy="hydrotest-kind-select"
                      error={!!formState.errors.testKindId}
                      InputLabelProps={{ shrink: true }}
                      SelectProps={{
                        multiple: true,
                        renderValue: selection => ChipBox(selection, field),
                      }}
                      sx={{
                        backgroundColor: !!formState.errors.testKindId
                          ? "#fff6f6"
                          : "transparent",
                        borderRadius: "4px",
                      }}
                      onChange={e => {
                        e.stopPropagation();
                        field.onChange(e.target.value);
                        if (e.target.value.length === 0) {
                          resetRelatedFormValues();
                        }
                        trigger();
                        setHydrotestKindIds(e.target.value);
                      }}>
                      {domains?.data
                        ?.filter(
                          d =>
                            d.schema ===
                            hydrogeologySchemaConstants.hydrotestKind,
                        )
                        .sort((a, b) => a.order - b.order)
                        .map(d => (
                          <MenuItem key={d.id} value={d.id}>
                            {d[i18n.language]}
                          </MenuItem>
                        ))}
                    </TextField>
                  )}
                />
              </FormControl>
              <FormControl
                variant="outlined"
                sx={{ flex: "1", marginRight: "10px" }}>
                <Controller
                  name="flowDirectionId"
                  control={control}
                  defaultValue={
                    hydrotest?.codelists
                      ?.filter(
                        c =>
                          c.schema ===
                          hydrogeologySchemaConstants.hydrotestFlowDirection,
                      )
                      .map(c => c.id) || []
                  }
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      disabled={
                        !!formState.errors.testKindId ||
                        !filteredTestKindDomains?.data?.filter(
                          d =>
                            d.schema ===
                            hydrogeologySchemaConstants.hydrotestFlowDirection,
                        ).length > 0
                      }
                      label={t("flowDirection")}
                      variant="outlined"
                      size="small"
                      value={field.value || ""}
                      data-cy="flow-direction-select"
                      InputLabelProps={{ shrink: true }}
                      SelectProps={{
                        multiple: true,
                        renderValue: selection => ChipBox(selection, field),
                      }}
                      onChange={e => {
                        e.stopPropagation();
                        field.onChange(e.target.value);
                      }}>
                      {filteredTestKindDomains?.data
                        ?.filter(
                          d =>
                            d.schema ===
                            hydrogeologySchemaConstants.hydrotestFlowDirection,
                        )
                        .map(d => (
                          <MenuItem key={d.id} value={d.id}>
                            {d[i18n.language]}
                          </MenuItem>
                        ))}
                    </TextField>
                  )}
                />
              </FormControl>
            </Stack>
            <Stack direction="row" sx={{ paddingTop: "10px" }}>
              <FormControl
                variant="outlined"
                sx={{ flex: "1", marginRight: "10px" }}>
                <Controller
                  name="evaluationMethodId"
                  control={control}
                  defaultValue={
                    hydrotest?.codelists
                      ?.filter(
                        c =>
                          c.schema ===
                          hydrogeologySchemaConstants.hydrotestEvaluationMethod,
                      )
                      .map(c => c.id) || []
                  }
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      disabled={
                        !!formState.errors.testKindId ||
                        !filteredTestKindDomains?.data?.filter(
                          d =>
                            d.schema ===
                            hydrogeologySchemaConstants.hydrotestEvaluationMethod,
                        ).length > 0
                      }
                      label={t("evaluationMethod")}
                      variant="outlined"
                      size="small"
                      value={field.value || ""}
                      data-cy="evaluation-method-select"
                      InputLabelProps={{ shrink: true }}
                      SelectProps={{
                        multiple: true,
                        renderValue: selection => ChipBox(selection, field),
                      }}
                      onChange={e => {
                        e.stopPropagation();
                        field.onChange(e.target.value);
                      }}>
                      {filteredTestKindDomains?.data
                        ?.filter(
                          d =>
                            d.schema ===
                            hydrogeologySchemaConstants.hydrotestEvaluationMethod,
                        )
                        .map(d => (
                          <MenuItem key={d.id} value={d.id}>
                            {d[i18n.language]}
                          </MenuItem>
                        ))}
                    </TextField>
                  )}
                />
              </FormControl>
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
                      formState.isValid && setIsAddingHydrotestResult(true);
                      !formState.isValid &&
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
              handleSubmit={handleSubmit}
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
                    formState.isValid && !editingHydrotestResultId
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
    </Card>
  );
};

export default React.memo(HydrotestInput);
