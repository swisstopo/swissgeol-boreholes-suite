import React from "react";
import { Stack, Tooltip, Typography } from "@mui/material";
import { StackFullWidth } from "../../../../components/baseComponents";
import { FormDisplay, FormDisplayType } from "../../../../components/form/form";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import ObservationDisplay from "./observationDisplay";

const GroundwaterLevelMeasurementDisplay = props => {
  const { item, selected, setSelected, isEditable, deleteData } = props;
  const { t } = useTranslation();

  return (
    <>
      <StackFullWidth direction="row" justifyContent="space-between">
        <StackFullWidth direction="column" justifyContent="space-between">
          <Typography sx={{ mr: 1, mt: 2, fontWeight: "bold" }}>
            {t("groundwater_level_measurement")}
          </Typography>
          <ObservationDisplay observation={item} />
          <StackFullWidth direction="row" spacing={1}>
            <FormDisplay
              label="gwlm_kind"
              value={item?.kind}
              type={FormDisplayType.Domain}
            />
          </StackFullWidth>
          <StackFullWidth direction="row" spacing={1}>
            <FormDisplay label="gwlm_levelm" value={item?.levelM} />
            <FormDisplay label="gwlm_levelmasl" value={item?.levelMasl} />
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
              color={selected ? "disabled" : "black"}
              data-cy="edit-icon"
              onClick={e => {
                e.stopPropagation();
                !selected && setSelected(item);
              }}
            />
          </Tooltip>
          <Tooltip title={t("delete")}>
            <DeleteIcon
              data-cy="delete-icon"
              sx={{
                color: selected ? "rgba(0, 0, 0, 0.26)" : "red",
                opacity: 0.7,
              }}
              onClick={e => {
                e.stopPropagation();
                !selected && deleteData(item.id);
              }}
            />
          </Tooltip>
        </Stack>
      </StackFullWidth>
      <Stack direction="column"></Stack>
    </>
  );
};

export default GroundwaterLevelMeasurementDisplay;
