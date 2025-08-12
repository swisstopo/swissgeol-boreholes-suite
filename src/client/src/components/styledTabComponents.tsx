import { Box, Tab, Tabs } from "@mui/material";
import { styled } from "@mui/system";
import { theme } from "../AppTheme";

export const BoreholeTabContentBox = styled(Box)(() => ({
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.border.light}`,
  padding: `${theme.spacing(3)}`,
  display: "flex",
  flexDirection: "column",
}));

export const BoreholeTabs = styled(Tabs)({
  overflow: "visible",
  margin: "0 4px",
  "& .MuiTabs-indicator": {
    display: "none",
  },
});

interface BoreholeTabProps {
  label: string;
  key: string;
  "data-cy": string;
  hasContent: boolean | undefined;
}

export const BoreholeTab = styled(({ ...props }: BoreholeTabProps) => <Tab disableRipple {...props} />, {
  shouldForwardProp: prop => prop !== "hasContent",
})(({ theme, hasContent }) => ({
  fontSize: "16px",
  fontWeight: 400,
  paddingTop: theme.spacing(2),
  paddingBottom: theme.spacing(2),
  paddingRight: theme.spacing(3),
  paddingLeft: theme.spacing(3),
  color: hasContent === false ? theme.palette.buttonStates.outlined.disabled.color : theme.palette.secondary.main,

  "&.Mui-selected": {
    color: theme.palette.background.menuItemActive,
    backgroundColor: theme.palette.background.default,
    borderTop: `1px solid ${theme.palette.border.light}`,
    borderRight: `1px solid ${theme.palette.border.light}`,
    borderLeft: `1px solid ${theme.palette.border.light}`,
    borderBottom: `1px solid ${theme.palette.background.default}`,
    borderRadius: `${theme.spacing(0.5)} ${theme.spacing(0.5)} 0 0`,
    top: "1px",
  },
  "&.Mui-focusVisible": {
    backgroundColor: theme.palette.background.tabFocus,
  },
}));

export const TabsWithDivider = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.border.light}`,
  "& .MuiTabs-indicator": {
    transform: "translateY(1px)",
  },
}));

export const TabWithContent = styled(({ ...props }: BoreholeTabProps) => <Tab disableRipple {...props} />, {
  shouldForwardProp: prop => prop !== "hasContent",
})(({ theme, hasContent }) => ({
  color: hasContent === false ? theme.palette.buttonStates.outlined.disabled.color : theme.palette.secondary.main,
  "&.Mui-focusVisible": {
    backgroundColor: theme.palette.background.tabFocus,
  },
}));
