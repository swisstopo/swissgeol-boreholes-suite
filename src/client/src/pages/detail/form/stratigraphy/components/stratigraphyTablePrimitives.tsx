import { Stack } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import { styled } from "@mui/system";
import { theme } from "../../../../../AppTheme.ts";

export const defaultRowHeight = 240;

// Approximate body1/body2 line height (~16-14px font * ~1.5 leading). Used to compute how many
// whole lines fit so -webkit-line-clamp cuts on a line boundary instead of mid-glyph.
export const APPROX_LINE_HEIGHT_PX = 24;

// Returns sx props that clamp content to a given number of lines with a trailing ellipsis.
export const lineClampSx = (maxLines: number): SxProps<Theme> => ({
  display: "-webkit-box",
  WebkitLineClamp: maxLines,
  WebkitBoxOrient: "vertical",
  overflow: "hidden",
  overflowWrap: "anywhere",
  wordBreak: "break-word",
  "& > *:not(:first-child)": {
    marginTop: theme.spacing(1),
  },
});

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
