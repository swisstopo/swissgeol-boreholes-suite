import React from "react";
import { Stack, Tooltip } from "@mui/material";
import { StackFullWidth } from "../../../../components/baseComponents";
import { FormDisplay, FormDisplayType } from "../../../../components/form/form";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";

const CasingDisplay = props => {
  const { item, selected, setSelected, isEditable, deleteData } = props;
  const { t } = useTranslation();

  return (
    <StackFullWidth direction="row" justifyContent="space-between">
      <StackFullWidth direction="column" justifyContent="space-between">
        <FormDisplay label="name" value={item?.name} />
        <StackFullWidth direction="row" spacing={1}>
          <FormDisplay label="fromdepth" value={item?.fromDepth} />
          <FormDisplay label="todepth" value={item?.toDepth} />
        </StackFullWidth>
        <StackFullWidth direction="row" spacing={1}>
          <FormDisplay
            label="kindCasingLayer"
            value={item?.kind}
            type={FormDisplayType.Domain}
          />
          <FormDisplay
            label="materialCasingLayer"
            value={item?.material}
            type={FormDisplayType.Domain}
          />
        </StackFullWidth>
        <StackFullWidth direction="row" spacing={1}>
          <FormDisplay
            label="dateStartCasing"
            value={item?.dateStart}
            type={FormDisplayType.Date}
          />
          <FormDisplay
            label="dateFinishCasing"
            value={item?.dateFinish}
            type={FormDisplayType.Date}
          />
        </StackFullWidth>
        <StackFullWidth direction="row" spacing={1}>
          <FormDisplay
            label="casing_inner_diameter"
            value={item?.innerDiameter}
          />
          <FormDisplay
            label="casing_outer_diameter"
            value={item?.outerDiameter}
          />
        </StackFullWidth>
        <FormDisplay label="notes" value={item?.notes} />
      </StackFullWidth>
      <Stack
        direction="row"
        sx={{
          marginLeft: "auto",
          visibility: isEditable ? "visible" : "hidden",
        }}>
        <Tooltip title={t("edit")}>
          <ModeEditIcon
            sx={{
              color: selected ? "disabled" : "black",
              cursor: "pointer",
            }}
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
              cursor: "pointer",
            }}
            onClick={e => {
              e.stopPropagation();
              !selected && deleteData(item.id);
            }}
          />
        </Tooltip>
      </Stack>
    </StackFullWidth>
  );
};

export default CasingDisplay;
