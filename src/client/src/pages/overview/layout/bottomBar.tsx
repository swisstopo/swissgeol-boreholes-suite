import { Box, Button } from "@mui/material";
import ArrowDownIcon from "../../../assets/icons/arrow_down.svg?react";
import ArrowUpIcon from "../../../assets/icons/arrow_up.svg?react";
import { BottomBarProps } from "../../../commons/search/menuItemsInterfaces.ts";
import { BoreholeNumbersPreview } from "../../../commons/menu/mainView/menuComponents/boreholeNumbersPreview.tsx";
import { useTranslation } from "react-i18next";
import { theme } from "../../../AppTheme.ts";

const BottomBar = ({ toggleBottomDrawer, bottomDrawerOpen, boreholes }: BottomBarProps) => {
  const { t } = useTranslation();
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
      <BoreholeNumbersPreview boreholes={boreholes} />
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
