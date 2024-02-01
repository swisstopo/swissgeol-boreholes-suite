import React from "react";
import { Stack, Tooltip, Typography } from "@mui/material";
import { StackFullWidth } from "./styledComponents";
import { FormDisplay, FormDisplayType } from "../../../../components/form/form";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import ObservationDisplay from "./observationDisplay";

const FieldMeasurementDisplay = props => {
  const {
    fieldMeasurement,
    selectedFieldMeasurement,
    setSelectedFieldMeasurement,
    isEditable,
    deleteFieldMeasurement,
    getParameterUnit,
  } = props;
  const { t } = useTranslation();

  return (
    <>
      <StackFullWidth direction="row" justifyContent="space-between">
        <StackFullWidth direction="column" justifyContent="space-between">
          <Typography sx={{ mr: 1, mt: 2, fontWeight: "bold" }}>
            {t("field_measurement")}
          </Typography>
          <ObservationDisplay observation={fieldMeasurement} />
          <StackFullWidth direction="row" spacing={1}>
            <FormDisplay
              label="field_measurement_sample_type"
              value={fieldMeasurement?.sampleType}
              type={FormDisplayType.Domain}
            />
            <FormDisplay
              label="parameter"
              value={fieldMeasurement?.parameter}
              type={FormDisplayType.Domain}
            />
          </StackFullWidth>
          <StackFullWidth direction="row" spacing={1}>
            <FormDisplay
              label="value"
              value={
                fieldMeasurement?.value && (
                  <>
                    <span>{fieldMeasurement?.value + " "}</span>
                    {getParameterUnit(fieldMeasurement.parameterId)}
                  </>
                )
              }
            />
          </StackFullWidth>
        </StackFullWidth>
        <Stack
          direction="row"
          sx={{
            marginLeft: "auto",
            visibility: isEditable ? "visible" : "hidden",
          }}>
          <Tooltip title={t("edit")}>
            <ModeEditIcon
              color={selectedFieldMeasurement ? "disabled" : "black"}
              data-cy="edit-icon"
              onClick={e => {
                e.stopPropagation();
                !selectedFieldMeasurement &&
                  setSelectedFieldMeasurement(fieldMeasurement);
              }}
            />
          </Tooltip>
          <Tooltip title={t("delete")}>
            <DeleteIcon
              data-cy="delete-icon"
              sx={{
                color: selectedFieldMeasurement ? "rgba(0, 0, 0, 0.26)" : "red",
                opacity: 0.7,
              }}
              onClick={e => {
                e.stopPropagation();
                !selectedFieldMeasurement &&
                  deleteFieldMeasurement(fieldMeasurement.id);
              }}
            />
          </Tooltip>
        </Stack>
      </StackFullWidth>
      <Stack direction="column"></Stack>
    </>
  );
};

export default FieldMeasurementDisplay;
