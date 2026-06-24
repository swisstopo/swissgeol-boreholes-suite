import { SxProps, Theme } from "@mui/material/styles";
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
