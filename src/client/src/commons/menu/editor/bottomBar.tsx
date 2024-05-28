import { Box, Button } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { BottomBarProps } from "./menuComponents/menuComponentInterfaces";
import { BoreholeNumbersPreview } from "./menuComponents/boreholeNumbersPreview";
import { useTranslation } from "react-i18next";
import { theme } from "../../../AppTheme";

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
        sx={{ fontWeight: "normal", fontSize: "1em" }}>
        {bottomDrawerOpen ? (
          <>
            {t("hideTable")} <KeyboardArrowDownIcon />
          </>
        ) : (
          <>
            {t("showTable")}
            <KeyboardArrowUpIcon />{" "}
          </>
        )}
      </Button>
    </Box>
  );
};

export default BottomBar;
