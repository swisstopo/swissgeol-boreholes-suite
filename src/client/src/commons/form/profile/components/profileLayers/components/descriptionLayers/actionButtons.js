import React from "react";
import { Stack, Tooltip } from "@mui/material";
import { useTranslation } from "react-i18next";
import ClearIcon from "@mui/icons-material/Clear";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import DeleteIcon from "@mui/icons-material/Delete";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { useTheme } from "@mui/material/styles";

const ActionButtons = props => {
  const {
    item,
    selectItem,
    addMutation,
    selectedDescription,
    selectedStratigraphyID,
    setDescriptionIdSelectedForDelete,
  } = props;
  const { t } = useTranslation();
  const theme = useTheme();

  return (
    <Stack direction="row" sx={{ marginLeft: "auto", padding: "3px" }}>
      {selectedDescription?.id !== item?.id && item.id !== null ? (
        <>
          <Tooltip title={t("edit")}>
            <ModeEditIcon onClick={() => selectItem(item)} />
          </Tooltip>
          <Tooltip title={t("delete")}>
            <DeleteIcon
              sx={{ color: "red", opacity: 0.7 }}
              onClick={e => {
                e.stopPropagation();

                setDescriptionIdSelectedForDelete(item.id);
              }}
            />
          </Tooltip>
        </>
      ) : (
        item.id === null && (
          <Tooltip title={t("add")}>
            <AddCircleIcon
              style={{ color: theme.palette.error.main }}
              onClick={e => {
                e.stopPropagation();
                addMutation.mutate({
                  stratigraphyId: selectedStratigraphyID,
                  fromDepth: item.fromDepth,
                  toDepth: item.toDepth,
                });
              }}
            />
          </Tooltip>
        )
      )}
      {selectedDescription?.id === item?.id && (
        <Tooltip title={t("stop-editing")}>
          <ClearIcon
            onClick={e => {
              e.stopPropagation();
              selectItem(null);
            }}
          />
        </Tooltip>
      )}
    </Stack>
  );
};
export default ActionButtons;
