import { useTranslation } from "react-i18next";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import ClearIcon from "@mui/icons-material/Clear";
import DeleteIcon from "@mui/icons-material/Delete";
import ModeEditIcon from "@mui/icons-material/ModeEdit";
import { Stack, Tooltip } from "@mui/material";
import { theme } from "../../../../../../../AppTheme.ts";

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

  return (
    <Stack direction="row" sx={{ marginLeft: "auto", padding: "3px" }}>
      {selectedDescription?.id !== item?.id && item.id !== null ? (
        <>
          <Tooltip title={t("edit")}>
            <ModeEditIcon onClick={() => selectItem(item)} />
          </Tooltip>
          <Tooltip title={t("delete")}>
            <DeleteIcon
              color="error"
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
