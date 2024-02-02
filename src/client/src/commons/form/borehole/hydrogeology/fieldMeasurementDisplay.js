import React from "react";
import { Stack, Tooltip, Typography } from "@mui/material";
import { StackFullWidth } from "./styledComponents";
import { FormDisplay, FormDisplayType } from "../../../../components/form/form";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";
import ObservationDisplay from "./observationDisplay";
import { FieldMeasurementParameterUnits } from "./parameterUnits";
import { useDomains } from "../../../../api/fetchApiV2";

const FieldMeasurementDisplay = props => {
  const { item, selected, setSelected, isEditable, deleteData } = props;
  const { t } = useTranslation();
  const domains = useDomains();

  const getParameterUnit = parameterId => {
    return FieldMeasurementParameterUnits[
      domains.data?.find(d => d.id === parameterId)?.geolcode
    ];
  };

  return (
    <>
      <StackFullWidth direction="row" justifyContent="space-between">
        <StackFullWidth direction="column" justifyContent="space-between">
          <Typography sx={{ mr: 1, mt: 2, fontWeight: "bold" }}>
            {t("field_measurement")}
          </Typography>
          <ObservationDisplay observation={item} />
          <StackFullWidth direction="row" spacing={1}>
            <FormDisplay
              label="field_measurement_sample_type"
              value={item?.sampleType}
              type={FormDisplayType.Domain}
            />
            <FormDisplay
              label="parameter"
              value={item?.parameter}
              type={FormDisplayType.Domain}
            />
          </StackFullWidth>
          <StackFullWidth direction="row" spacing={1}>
            <FormDisplay
              label="value"
              value={
                item?.value && (
                  <>
                    <span>{item?.value + " "}</span>
                    {getParameterUnit(item.parameterId)}
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

export default FieldMeasurementDisplay;
