import { Box, Tab, Tabs } from "@mui/material";
import { styled } from "@mui/system";
import { theme } from "../AppTheme";

export const BdmsTabContentBox = styled(Box)(() => ({
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.boxShadow}`,
  padding: `${theme.spacing(3)}`,
  display: "flex",
  flexDirection: "column",
}));

export const BdmsTabs = styled(Tabs)({
  overflow: "visible",
  margin: "0 4px",
  "& .MuiTabs-indicator": {
    display: "none",
  },
});

export const BdmsTab = styled(props => <Tab disableRipple {...props} />)(() => ({
  fontSize: "16px",
  fontWeight: "400",
  paddingTop: `${theme.spacing(2)}`,
  paddingBottom: `${theme.spacing(2)}`,
  paddingRight: `${theme.spacing(3)}`,
  paddingLeft: `${theme.spacing(3)}`,
  color: theme.palette.secondary.main,

  "&.Mui-selected": {
    color: theme.palette.background.menuItemActive,
    backgroundColor: theme.palette.background.default,
    borderTop: `1px solid ${theme.palette.boxShadow}`,
    borderRight: `1px solid ${theme.palette.boxShadow}`,
    borderLeft: `1px solid ${theme.palette.boxShadow}`,
    borderBottom: `1px solid ${theme.palette.background.default}`,
    borderRadius: `${theme.spacing(0.5)} ${theme.spacing(0.5)} 0 0`,
    top: "1px",
  },
  "&.Mui-focusVisible": {
    backgroundColor: "rgba(100, 95, 228, 0.32)",
  },
}));
