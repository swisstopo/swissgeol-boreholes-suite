import { Box, Button } from "@mui/material";
import ArrowDownIcon from "../../../assets/icons/arrow_down.svg?react";
import ArrowUpIcon from "../../../assets/icons/arrow_up.svg?react";
import { BoreholeNumbersPreview } from "./boreholeNumbersPreview.tsx";
import { useTranslation } from "react-i18next";
import { theme } from "../../../AppTheme";
import { Boreholes } from "../../../api-lib/ReduxStateInterfaces.ts";
import { CopyButton, DeleteButton, EditButton } from "../../../components/buttons/buttons.tsx";
import { useContext } from "react";
import { BoreholesContext } from "../../boreholesContext.tsx";

interface BottomBarProps {
  toggleBottomDrawer: (open: boolean) => void;
  bottomDrawerOpen: boolean;
  boreholes: Boreholes;
  deleteSelected: () => void;
  duplicateSelected:  () => void;
  bulkEditSelected: () => void;
}

const BottomBar = ({
  toggleBottomDrawer,
  bottomDrawerOpen,
  deleteSelected,
  duplicateSelected,
  bulkEditSelected,
}: BottomBarProps) => {
  const { t } = useTranslation();
  const { isFetching, boreholeCount, selectionModel } = useContext(BoreholesContext);

  return (
    <Box
      sx={{
        position: "relative",
        width: "100%",
        height: 50,
        backgroundColor: theme.palette.background.lightgrey,
        borderTop: "1px solid #ddd",
        padding: "1em",
        display: "flex",
        direction: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
      {selectionModel.length > 0 ? (
        <>
          <DeleteButton onClick={deleteSelected} />
          {selectionModel.length === 1 && <CopyButton onClick={duplicateSelected} />}
          <EditButton label={"bulkEdit"} onClick={bulkEditSelected} />
          {t("selectedCount", { count: selectionModel.length })}
        </>
      ) : (
        <BoreholeNumbersPreview isFetching={isFetching} boreholeCount={boreholeCount} />
      )}
      <Box sx={{ flex: 1 }}></Box>
      <Button
        onClick={() => toggleBottomDrawer(!bottomDrawerOpen)}
        data-cy="showTableButton"
        sx={{ fontWeight: "normal", fontSize: "14px" }}
        endIcon={bottomDrawerOpen ? <ArrowDownIcon /> : <ArrowUpIcon />}>
        {bottomDrawerOpen ? t("hideTable") : t("showTable")}
      </Button>
    </Box>
  );
};

export default BottomBar;
