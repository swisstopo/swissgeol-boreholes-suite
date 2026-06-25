import { SxProps, Theme } from "@mui/material/styles";
import { theme } from "../../../../../AppTheme.ts";

export const defaultRowHeight = 240;

// Approximate body1/body2 line height (~16-14px font * ~1.5 leading). Used to compute how many
// whole lines fit so -webkit-line-clamp cuts on a line boundary instead of mid-glyph.
export const approximateLineHeightPx = 24;

// Vertical padding subtracted from observed cell height before deriving the line-clamp count.
// Keeps scaled and edit-mode cells clamping at the same line count for the same effective height.
export const cellVerticalPaddingPx = 16;

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
