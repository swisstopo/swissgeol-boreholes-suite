import React from "react";
import { Stack, Tooltip, Typography } from "@mui/material";
import { StackFullWidth } from "./styledComponents";
import { FormDisplay, FormDisplayType } from "../../../../components/form/form";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import ObservationDisplay from "./observationDisplay";

const WaterIngressDisplay = props => {
  const {
    waterIngress,
    selectedWaterIngress,
    setSelectedWaterIngress,
    isEditable,
    deleteWaterIngress,
  } = props;
  const { t } = useTranslation();

  return (
    <>
      <StackFullWidth direction="row" justifyContent="space-between">
        <StackFullWidth direction="column" justifyContent="space-between">
          <Typography sx={{ mr: 1, mt: 2, fontWeight: "bold" }}>
            {t("water_ingress")}
          </Typography>
          <ObservationDisplay observation={waterIngress} />
          <StackFullWidth direction="row" spacing={1}>
            <FormDisplay
              label="quantity"
              value={waterIngress?.quantity}
              type={FormDisplayType.Domain}
            />
            <FormDisplay
              label="conditions"
              value={waterIngress?.conditions}
              type={FormDisplayType.Domain}
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
              color={selectedWaterIngress ? "disabled" : "black"}
              data-cy="edit-icon"
              onClick={e => {
                e.stopPropagation();
                !selectedWaterIngress && setSelectedWaterIngress(waterIngress);
              }}
            />
          </Tooltip>
          <Tooltip title={t("delete")}>
            <DeleteIcon
              data-cy="delete-icon"
              sx={{
                color: selectedWaterIngress ? "rgba(0, 0, 0, 0.26)" : "red",
                opacity: 0.7,
              }}
              onClick={e => {
                e.stopPropagation();
                !selectedWaterIngress && deleteWaterIngress(waterIngress.id);
              }}
            />
          </Tooltip>
        </Stack>
      </StackFullWidth>
    </>
  );
};

export default WaterIngressDisplay;
