import { Box, IconButton } from "@mui/material";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import { BottomBarProps } from "./menuComponents/menuComponentInterfaces";
import { BoreholeNumbersPreview } from "./menuComponents/boreholeNumbersPreview";
import { BoreholesData } from "./menuComponents/menuComponentInterfaces";
import { connect } from "react-redux";
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
      <Box>{bottomDrawerOpen ? t("hideTable") : t("showTable")} </Box>
      <IconButton onClick={() => toggleBottomDrawer(!bottomDrawerOpen)}>
        {bottomDrawerOpen ? <KeyboardArrowDownIcon /> : <KeyboardArrowUpIcon />}
      </IconButton>
    </Box>
  );
};

const mapStateToProps = (state: { core_borehole_editor_list: BoreholesData }) => {
  return {
    boreholes: state.core_borehole_editor_list,
  };
};

const ConnectedBottomBar = connect(mapStateToProps)(BottomBar);
export default ConnectedBottomBar;
