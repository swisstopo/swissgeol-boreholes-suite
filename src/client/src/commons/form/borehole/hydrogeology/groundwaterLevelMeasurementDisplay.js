import React from "react";
import { Card, Stack, Tooltip, Typography } from "@mui/material";
import { StackFullWidth } from "./styledComponents";
import { FormDisplay, FormDisplayType } from "../../../../components/form/form";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import ObservationDisplay from "./observationDisplay";

const GroundwaterLevelMeasurementDisplay = props => {
  const {
    groundwaterLevelMeasurement,
    selectedGroundwaterLevelMeasurement,
    setSelectedGroundwaterLevelMeasurement,
    isEditable,
    deleteGroundwaterLevelMeasurement,
  } = props;
  const { t } = useTranslation();

  return (
    <Card
      key={groundwaterLevelMeasurement.id}
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
            {t("groundwater_level_measurement")}
          </Typography>
          <ObservationDisplay observation={groundwaterLevelMeasurement} />
          <StackFullWidth direction="row" spacing={1}>
            <FormDisplay
              label="gwlm_kind"
              value={groundwaterLevelMeasurement?.kind}
              type={FormDisplayType.Domain}
            />
          </StackFullWidth>
          <StackFullWidth direction="row" spacing={1}>
            <FormDisplay
              label="gwlm_levelm"
              value={groundwaterLevelMeasurement?.levelM}
            />
            <FormDisplay
              label="gwlm_levelmasl"
              value={groundwaterLevelMeasurement?.levelMasl}
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
              color={selectedGroundwaterLevelMeasurement ? "disabled" : "black"}
              data-cy="edit-icon"
              onClick={e => {
                e.stopPropagation();
                !selectedGroundwaterLevelMeasurement &&
                  setSelectedGroundwaterLevelMeasurement(
                    groundwaterLevelMeasurement,
                  );
              }}
            />
          </Tooltip>
          <Tooltip title={t("delete")}>
            <DeleteIcon
              data-cy="delete-icon"
              sx={{
                color: selectedGroundwaterLevelMeasurement
                  ? "rgba(0, 0, 0, 0.26)"
                  : "red",
                opacity: 0.7,
              }}
              onClick={e => {
                e.stopPropagation();
                !selectedGroundwaterLevelMeasurement &&
                  deleteGroundwaterLevelMeasurement(
                    groundwaterLevelMeasurement.id,
                  );
              }}
            />
          </Tooltip>
        </Stack>
      </StackFullWidth>
      <Stack direction="column"></Stack>
    </Card>
  );
};

export default GroundwaterLevelMeasurementDisplay;
