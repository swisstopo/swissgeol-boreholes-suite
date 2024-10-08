import { Box, Tab, Tabs } from "@mui/material";
import { styled } from "@mui/system";
import { theme } from "../AppTheme";

export const BdmsTabContentBox = styled(Box)(() => ({
  backgroundColor: theme.palette.background.default,
  borderBottom: `1px solid ${theme.palette.boxShadow}`,
  borderRight: `1px solid ${theme.palette.boxShadow}`,
  borderLeft: `1px solid ${theme.palette.boxShadow}`,
  borderRadius: "3px",
  padding: "10px 10px 5px 10px",
  margin: "0 5px 10px 5px",
  display: "flex",
  flexDirection: "column",
}));

export const BdmsTabs = styled(Tabs)({
  margin: "0 4px",
  "& .MuiTabs-indicator": {
    display: "none",
  },
});

export const BdmsTab = styled(props => <Tab disableRipple {...props} />)(() => ({
  "&.Mui-selected": {
    backgroundColor: theme.palette.background.default,
    borderTop: `1px solid ${theme.palette.boxShadow}`,
    borderRight: `1px solid ${theme.palette.boxShadow}`,
    borderLeft: `1px solid ${theme.palette.boxShadow}`,
    borderRadius: "3px solid black",
  },
  "&.Mui-focusVisible": {
    backgroundColor: "rgba(100, 95, 228, 0.32)",
  },
}));
