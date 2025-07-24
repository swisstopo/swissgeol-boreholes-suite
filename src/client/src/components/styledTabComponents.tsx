import { Box, Tab, Tabs } from "@mui/material";
import { styled } from "@mui/system";
import { theme } from "../AppTheme";

export const BoreholeTabContentBox = styled(Box, {
  shouldForwardProp: prop => prop !== "firstTabSelected",
})<{ firstTabSelected?: boolean }>(({ firstTabSelected }) => ({
  backgroundColor: theme.palette.background.default,
  border: `1px solid ${theme.palette.border.darker}`,
  padding: theme.spacing(3),
  display: "flex",
  flexDirection: "column",
  minHeight: "92px",
  borderTopLeftRadius: firstTabSelected ? 0 : theme.spacing(1),
  borderTopRightRadius: theme.spacing(1),
  borderBottomRightRadius: theme.spacing(1),
  borderBottomLeftRadius: theme.spacing(1),
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
    borderTop: `1px solid ${theme.palette.border.darker}`,
    borderRight: `1px solid ${theme.palette.border.darker}`,
    borderLeft: `1px solid ${theme.palette.border.darker}`,
    borderBottom: `1px solid ${theme.palette.background.default}`,
    borderTopLeftRadius: theme.spacing(1),
    borderTopRightRadius: theme.spacing(1),
    top: "1px",
  },
  "&.Mui-focusVisible": {
    backgroundColor: theme.palette.background.tabFocus,
  },
}));

export const TabsWithDivider = styled(Tabs)(({ theme }) => ({
  borderBottom: `1px solid ${theme.palette.border.darker}`,
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
