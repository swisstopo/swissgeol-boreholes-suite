import { Stack } from "@mui/material";
import { styled } from "@mui/system";
import { theme } from "../../../../../AppTheme.ts";

export const defaultRowHeight = 240;

export const StratigraphyTableHeader = styled(Stack)(() => ({
  flexDirection: "row",
  justifyContent: "space-between",
  borderTopLeftRadius: theme.spacing(0.5),
  borderTopRightRadius: theme.spacing(0.5),
  backgroundColor: theme.palette.background.listItemActive,
  borderBottom: `2px solid ${theme.palette.border.darker}`,
  boxShadow: theme.shadows[3],
}));

export const StratigraphyTableContent = styled(Stack)(() => ({
  flexDirection: "row",
  justifyContent: "space-between",
  "& > *": {
    borderLeft: `1px solid ${theme.palette.border.darker}`,
  },
  "& > *:last-child": {
    borderRight: `1px solid ${theme.palette.border.darker}`,
  },
}));

export const StratigraphyTableColumn = styled(Stack)(() => ({
  flex: "1",
  minWidth: 0,
}));

export const StratigraphyTableCell = styled(Stack)(() => ({
  justifyContent: "space-between",
  padding: theme.spacing(2),
  borderBottom: `1px solid ${theme.palette.border.darker}`,
}));

export const StratigraphyTableCellRow = styled(Stack)(() => ({
  flexDirection: "row",
  justifyContent: "space-between",
  alignItems: "center",
  height: "36px",
}));
