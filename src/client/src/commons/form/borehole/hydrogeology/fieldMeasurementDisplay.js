import React from "react";
import { Card, Stack, Tooltip, Typography } from "@mui/material";
import {
  TypographyWithBottomMargin,
  StackFullWidth,
  StackHalfWidth,
} from "./styledComponents";
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
  } = props;
  const { t, i18n } = useTranslation();

  return (
    <Card
      key={fieldMeasurement.id}
      sx={{
        border: "1px solid lightgrey",
        borderRadius: "3px",
        p: 1.5,
        mb: 2,
        height: "100%",
      }}>
      <StackFullWidth direction="row" justifyContent="space-between">
        <StackFullWidth direction="column" justifyContent="space-between">
          <Typography sx={{ mr: 1, mt: 2, fontWeight: "bold" }}>
            {t("field_measurement")}
          </Typography>
          <ObservationDisplay observation={fieldMeasurement} />
          <StackFullWidth direction="row" spacing={1}>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">
                {t("field_measurement_sample_type")}
              </Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {fieldMeasurement.sampleType?.[i18n.language] || "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">{t("parameter")}</Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {fieldMeasurement.parameter?.[i18n.language] || "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
          </StackFullWidth>
          <StackFullWidth direction="row" spacing={1}>
            <StackHalfWidth direction="column">
              <Typography variant="subtitle2">{t("value")}</Typography>
              <TypographyWithBottomMargin variant="subtitle1">
                {fieldMeasurement.value || "-"}
              </TypographyWithBottomMargin>
            </StackHalfWidth>
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
    </Card>
  );
};

export default FieldMeasurementDisplay;
