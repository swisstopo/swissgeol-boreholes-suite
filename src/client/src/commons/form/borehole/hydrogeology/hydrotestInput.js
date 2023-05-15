import React, { useEffect, useContext, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  Box,
  Card,
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
import { useTranslation } from "react-i18next";
import { useHydrotestDomains, useDomains } from "../../../../api/fetchApiV2";
import { AlertContext } from "../../../alert/alertContext";
import { ObservationType } from "./observationType";

const HydrotestInput = ({
  hydrotest,
  setSelectedHydrotest,
  boreholeId,
  addHydrotest,
  updateHydrotest,
  setAddedHydrotestFromResultTable,
}) => {
  const [isAddingHydrotestResult, setIsAddingHydrotestResult] = useState(false);
  const [hydrotestKindId, setHydrotestKindId] = useState(
    hydrotest?.testKindId || 0,
  );
  const domains = useDomains();
  const filteredTestKindDomains = useHydrotestDomains(hydrotestKindId);
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

  const closeFormIfCompleted = () => {
    const formValues = getValues();
    if (!formValues.reliabilityId || !formValues.startTime) {
      alertContext.error(t("hydrotestRequiredFieldsAlert"));
    } else {
      handleSubmit(submitForm)();
      setSelectedHydrotest(null);
    }
  };

  const convertDateToIsoString = dateTime =>
    dateTime ? dateTime + ":00.000Z" : null;

  // trigger form validation on mount
  useEffect(() => {
    trigger();
  }, [trigger]);

  const prepareFormDataForSubmit = data => {
    data.startTime = convertDateToIsoString(data?.startTime);
    data.endTime = convertDateToIsoString(data?.endTime);

    // add codelists
    data.codelistIds = [...data.flowDirectionId, ...data.evaluationMethodId];

    delete data.flowDirectionId;
    delete data.evaluationMethodId;
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

    if (data.startTime && data.reliabilityId && data.testKindId) {
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
      updateHydrotest({ ...hydrotest, hydrotestResults: [] });
    }
  };
  // warn user that when changing testtype the results will be deleted.
  const handleMouseDown = e => {
    e.preventDefault();
    if (hydrotest?.hydrotestResults?.length > 0) {
      alertContext.error(t("hydrotestResultsWillBeDeleted"));
    }
  };

  const canAddHydrotestResults =
    formState.isValid &&
    !isAddingHydrotestResult &&
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
                  defaultValue={hydrotest.testKindId}
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
                      sx={{
                        backgroundColor: !!formState.errors.testKindId
                          ? "#fff6f6"
                          : "transparent",
                        borderRadius: "4px",
                      }}
                      onChange={e => {
                        e.stopPropagation();
                        field.onChange(e.target.value);
                        setValue("flowDirectionId", []);
                        setValue("evaluationMethodId", []);
                        deleteHydrotestResults();
                        setHydrotestKindId(e.target.value);
                        trigger();
                      }}
                      onMouseDown={handleMouseDown}>
                      {domains?.data
                        ?.filter(d => d.schema === "htest101")
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
                      ?.filter(c => c.schema === "htest102")
                      .map(c => c.id) || []
                  }
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      disabled={
                        !!formState.errors.testKindId ||
                        !filteredTestKindDomains?.data?.filter(
                          d => d.schema === "htest102",
                        ).length > 0
                      }
                      label={t("flowDirection")}
                      variant="outlined"
                      size="small"
                      value={field.value || ""}
                      data-cy="flow-direction-select"
                      InputLabelProps={{ shrink: true }}
                      SelectProps={{ multiple: true }}
                      onChange={e => {
                        e.stopPropagation();
                        field.onChange(e.target.value);
                      }}>
                      {filteredTestKindDomains?.data
                        ?.filter(d => d.schema === "htest102")
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
                      ?.filter(c => c.schema === "htest103")
                      .map(c => c.id) || []
                  }
                  render={({ field }) => (
                    <TextField
                      {...field}
                      select
                      disabled={
                        !!formState.errors.testKindId ||
                        !filteredTestKindDomains?.data?.filter(
                          d => d.schema === "htest103",
                        ).length > 0
                      }
                      label={t("evaluationMethod")}
                      variant="outlined"
                      size="small"
                      value={field.value || ""}
                      data-cy="evaluation-method-select"
                      InputLabelProps={{ shrink: true }}
                      SelectProps={{ multiple: true }}
                      onChange={e => {
                        e.stopPropagation();
                        field.onChange(e.target.value);
                      }}>
                      {filteredTestKindDomains?.data
                        ?.filter(d => d.schema === "htest103")
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
              hydrotestKindId={hydrotestKindId}
              filteredTestKindDomains={filteredTestKindDomains}
            />
          </Stack>
          <Box sx={{ marginLeft: "auto" }}>
            <Tooltip title={t("save")}>
              <CheckIcon
                sx={{ color: formState.isValid ? "#0080008c" : "disabled" }}
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
