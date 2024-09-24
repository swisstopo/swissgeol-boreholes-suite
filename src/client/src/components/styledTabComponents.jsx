import { Box, Tab, Tabs } from "@mui/material";
import { styled } from "@mui/system";

import { theme } from "../AppTheme";

export const BdmsTabContentBox = styled(Box)(() => ({
  backgroundColor: theme.palette.secondary.background,
  borderRadius: "3px",
  padding: "10px 10px 5px 10px",
  margin: "0 5px 10px 5px",
  display: "flex",
  flexDirection: "column",
  boxShadow:
    "0px 2px 1px -1px " +
    theme.palette.boxShadow +
    ", 0px 1px 1px 0px " +
    theme.palette.boxShadow +
    ", 0px 1px 3px 0px" +
    theme.palette.boxShadow,
}));

export const BdmsTabs = styled(Tabs)({
  margin: "0 4px",
  "& .MuiTabs-indicator": {
    display: "none",
  },
});

export const BdmsTab = styled(props => <Tab disableRipple {...props} />)(() => ({
  "&.Mui-selected": {
    backgroundColor: theme.palette.secondary.background,
    borderRadius: "3px",
  },
  "&.Mui-focusVisible": {
    backgroundColor: "rgba(100, 95, 228, 0.32)",
  },
}));
