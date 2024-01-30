import React from "react";
import { Stack, Tooltip } from "@mui/material";
import { StackFullWidth } from "./styledComponents";
import { FormDisplay, FormDisplayType } from "../../../../components/form/form";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DeleteIcon from "@mui/icons-material/Delete";
import { useTranslation } from "react-i18next";

const BackfillDisplay = props => {
  const { item, selected, setSelected, isEditable, deleteData } = props;
  const { t } = useTranslation();

  return (
    <StackFullWidth direction="row" justifyContent="space-between">
      <StackFullWidth direction="column" justifyContent="space-between">
        <StackFullWidth direction="row" spacing={1}>
          <FormDisplay label="fromdepth" value={item?.fromDepth} />
          <FormDisplay label="todepth" value={item?.toDepth} />
        </StackFullWidth>
        <StackFullWidth direction="row" spacing={1}>
          <FormDisplay
            label="kindFilling"
            value={item?.kind}
            type={FormDisplayType.Domain}
          />
          <FormDisplay
            label="materialFilling"
            value={item?.material}
            type={FormDisplayType.Domain}
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

export default BackfillDisplay;
