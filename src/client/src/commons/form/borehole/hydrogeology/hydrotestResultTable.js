import React, { useState, useEffect, useContext } from "react";
import { useTranslation } from "react-i18next";
import {
  InputAdornment,
  MenuItem,
  Stack,
  Table,
  TableHead,
  TableBody,
  TableContainer,
  TableRow,
  TableCell,
  TextField,
  Tooltip,
} from "@mui/material";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckIcon from "@mui/icons-material/Check";
import { useDomains } from "../../../../api/fetchApiV2";
import { ParameterUnits } from "./parameterUnits";
import { AlertContext } from "../../../alert/alertContext";

const HydrotestResultTable = ({
  isEditable,
  hydrotest,
  isAddingHydrotestResult,
  setIsAddingHydrotestResult,
  updateHydrotest,
  handleSubmit,
  submitForm,
  setAddedHydrotestFromResultTable,
  filteredTestKindDomains,
  hydrotestKindId,
}) => {
  const [editingId, setEditingId] = useState(null);
  const [formValues, setFormValues] = useState({
    parameterId: null,
    value: null,
    minValue: null,
    maxValue: null,
  });
  const [displayedHydrotestResults, setDisplayedHydrotestResults] = useState(
    [],
  );
  const { t, i18n } = useTranslation();
  const alertContext = useContext(AlertContext);
  const domains = useDomains();

  const handleChange = field => e => {
    setFormValues({
      ...formValues,
      [field]: e.target.value,
    });
  };

  const removeParameter = results => {
    return results.map(r => {
      delete r.parameter;
      return r;
    });
  };

  const addHydrotestResult = newTestResult => {
    if (hydrotest.id === 0) {
      hydrotest.hydrotestResults = [newTestResult];
      handleSubmit(submitForm)();
      setAddedHydrotestFromResultTable(true);
    } else {
      const existingResults = removeParameter(hydrotest.hydrotestResults || []);
      updateHydrotest({
        ...hydrotest,
        testKindId: hydrotestKindId,
        hydrotestResults: [...existingResults, newTestResult],
      });
    }
  };

  const updateHydrotestResult = (id, updatedTestResult) => {
    const unchangedResults = removeParameter(
      hydrotest?.hydrotestResults.filter(r => r.id !== id),
    );
    updateHydrotest({
      ...hydrotest,
      testKindId: hydrotestKindId,
      hydrotestResults: [...unchangedResults, updatedTestResult],
    });
  };

  const deleteHydrotestResult = id => {
    const remainingResults = removeParameter(
      hydrotest?.hydrotestResults.filter(r => r.id !== id),
    );
    updateHydrotest({
      ...hydrotest,
      hydrotestResults: [...remainingResults],
    });
  };

  const handleClose = id => {
    if (!formValues.parameterId) {
      alertContext.error(t("hydrotestResultRequiredFieldsAlert"));
    } else {
      if (id === 0) {
        addHydrotestResult({
          ...formValues,
          hydrotestId: hydrotest.Id,
        });
      } else {
        updateHydrotestResult(id, {
          ...formValues,
          hydrotestId: hydrotest.Id,
        });
      }
      setEditingId(null);
      resetForm();
      setIsAddingHydrotestResult(false);
    }
  };

  const resetForm = () => {
    setFormValues({
      parameterId: null,
      value: null,
      minValue: null,
      maxValue: null,
    });
  };

  // set form values when editing a result
  useEffect(() => {
    if (editingId) {
      const editingHydrotestResult = hydrotest.hydrotestResults?.find(
        r => r.id === editingId || r.tempId === editingId,
      );
      setFormValues({
        parameterId: editingHydrotestResult?.parameterId,
        value: editingHydrotestResult?.value,
        minValue: editingHydrotestResult?.minValue,
        maxValue: editingHydrotestResult?.maxValue,
      });
    }
  }, [
    editingId,
    hydrotest.hydrotestResults,
    hydrotest.hydrotestResults?.length,
  ]);

  // update hydrotestResults when adding a result
  useEffect(() => {
    const baseHydrotestResults =
      hydrotest?.hydrotestResults?.length > 0 ? hydrotest.hydrotestResults : [];
    const newResults = isAddingHydrotestResult
      ? [...baseHydrotestResults, { tempId: 0 }]
      : baseHydrotestResults;
    setDisplayedHydrotestResults(newResults);
  }, [isAddingHydrotestResult, hydrotest]);

  const tableCellStyles = {
    paddingRight: "3px",
    paddingLeft: "3px",
    flex: 1,
    width: "20%",
    maxWidth: "20%",
  };

  const tableHeaderStyles = {
    fontWeight: 900,
    padding: "3px",
    flex: 1,
    width: "20%",
    maxWidth: "20%",
  };

  return (
    <TableContainer>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell sx={{ ...tableHeaderStyles, paddingRight: 0 }}>
              {t("parameter")}
            </TableCell>
            <TableCell sx={tableHeaderStyles}>{t("value")}</TableCell>
            <TableCell sx={tableHeaderStyles}>{t("minValue")}</TableCell>
            <TableCell sx={tableHeaderStyles}>{t("maxValue")}</TableCell>
            {isEditable && (
              <TableCell align="right" sx={{ padding: "3px" }}></TableCell>
            )}
          </TableRow>
        </TableHead>
        <TableBody>
          {displayedHydrotestResults?.length > 0 &&
            displayedHydrotestResults?.map((result, index) => {
              const isEditing =
                result.id === editingId || result.tempId === editingId;
              const isAdding = result.tempId === 0;
              const id = result.id || result.tempId || 0; // blablabla
              return (
                <TableRow
                  key={index}
                  sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                  <TableCell
                    component="th"
                    scope="row"
                    sx={{
                      ...tableCellStyles,
                      "& .MuiFormControl-root": {
                        minWidth: "100%",
                        maxWidth: "100%",
                      },
                      pr: "3px",
                      pl: "3px",
                      maxWidth: "200px",
                      minWidth: "200px",
                    }}>
                    {isEditing || isAdding ? (
                      <TextField
                        select
                        size="small"
                        data-cy="parameter-select"
                        value={formValues.parameterId || ""}
                        label={t("parameter")}
                        InputLabelProps={{ shrink: true }}
                        onChange={handleChange("parameterId")}
                        error={!formValues.parameterId}
                        inputProps={{ style: { width: 100 } }}
                        sx={{
                          backgroundColor: !formValues.parameterId
                            ? "#fff6f6"
                            : "transparent",
                          borderRadius: "4px",
                        }}>
                        {filteredTestKindDomains?.data
                          ?.filter(d => d.schema === "htestres101")
                          .map(d => (
                            <MenuItem key={d.id} value={d.id}>
                              {d[i18n.language]}
                            </MenuItem>
                          ))}
                      </TextField>
                    ) : (
                      domains?.data?.find(d => d.id === result.parameterId)?.[
                        i18n.language
                      ] || ""
                    )}
                  </TableCell>
                  <TableCell sx={tableCellStyles}>
                    {isEditing || isAdding ? (
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        disabled={!formValues.parameterId}
                        label={t("value")}
                        value={formValues.value || ""}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              {ParameterUnits[formValues.parameterId]}
                            </InputAdornment>
                          ),
                        }}
                        onChange={handleChange("value")}
                      />
                    ) : (
                      result?.value &&
                      result?.value + " " + ParameterUnits[result.parameterId]
                    )}
                  </TableCell>
                  <TableCell sx={tableCellStyles}>
                    {isEditing || isAdding ? (
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        disabled={!formValues.parameterId}
                        label={t("minValue")}
                        value={formValues.minValue || ""}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              {ParameterUnits[formValues.parameterId]}
                            </InputAdornment>
                          ),
                        }}
                        onChange={handleChange("minValue")}
                      />
                    ) : (
                      result?.minValue &&
                      result?.minValue +
                        " " +
                        ParameterUnits[result.parameterId]
                    )}
                  </TableCell>
                  <TableCell sx={tableCellStyles}>
                    {isEditing || isAdding ? (
                      <TextField
                        type="number"
                        size="small"
                        fullWidth
                        disabled={!formValues.parameterId}
                        label={t("maxValue")}
                        value={formValues.maxValue || ""}
                        InputLabelProps={{ shrink: true }}
                        InputProps={{
                          endAdornment: (
                            <InputAdornment position="end">
                              {ParameterUnits[formValues.parameterId]}
                            </InputAdornment>
                          ),
                        }}
                        onChange={handleChange("maxValue")}
                      />
                    ) : (
                      result?.maxValue &&
                      result?.maxValue +
                        " " +
                        ParameterUnits[result.parameterId]
                    )}
                  </TableCell>
                  {isEditable && (
                    <TableCell>
                      <Stack direction="row" justifyContent="flex-end">
                        {isEditing || isAdding ? (
                          <Tooltip title={t("save")}>
                            <CheckIcon
                              sx={{
                                color: formValues.parameterId
                                  ? "#0080008c"
                                  : "lightgray",
                              }}
                              data-cy="save-hydrotest-result-icon"
                              onClick={e => {
                                e.stopPropagation();
                                handleClose(id);
                              }}
                            />
                          </Tooltip>
                        ) : (
                          <>
                            <Tooltip title={t("edit")}>
                              <ModeEditIcon
                                data-cy="edit-icon"
                                onClick={e => {
                                  e.stopPropagation();
                                  setEditingId(id);
                                }}
                              />
                            </Tooltip>
                            <Tooltip title={t("delete")}>
                              <DeleteIcon
                                data-cy="delete-icon"
                                sx={{
                                  color: "red",
                                  opacity: 0.7,
                                }}
                                onClick={e => {
                                  e.stopPropagation();
                                  deleteHydrotestResult(id);
                                }}
                              />
                            </Tooltip>
                          </>
                        )}
                      </Stack>
                    </TableCell>
                  )}
                </TableRow>
              );
            })}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default React.memo(HydrotestResultTable);
