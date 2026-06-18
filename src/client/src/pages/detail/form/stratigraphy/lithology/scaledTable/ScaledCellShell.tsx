import { FC, ReactNode, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Stack } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import { Copy } from "lucide-react";
import { theme } from "../../../../../../AppTheme.ts";
import { StandaloneIconButton } from "../../../../../../components/buttons/buttons.tsx";
import { useCopyToClipboard } from "../../../../../../hooks/useCopyToClipboard.ts";
import { useTypedResizeObserver } from "../../navigation/useTypedResizeObserver.ts";

interface ScaledCellShellProps {
  children: ReactNode;
  sx?: SxProps<Theme>;
}

// Vertical padding consumed by the outer Stack (theme.spacing(1) top + bottom = 16px).
const CELL_VERTICAL_PADDING_PX = 16;
// Approximate body1/body2 line height (~16-14px font × ~1.5 leading). Used to compute how many
// whole lines fit so -webkit-line-clamp cuts on a line boundary instead of mid-glyph.
const APPROX_LINE_HEIGHT_PX = 24;

export const ScaledCellShell: FC<ScaledCellShellProps> = ({ children, sx }) => {
  const { t } = useTranslation();
  const copyToClipboard = useCopyToClipboard();
  const cellRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const [maxLines, setMaxLines] = useState(1);

  // Recompute the clamp count whenever the cell's pixel height changes (zoom in/out, pan,
  // initial calibration). Clamping at a whole-line boundary prevents the half-cut bottom line
  // that plain overflow:hidden produces, and the ellipsis ("...") is rendered by the browser.
  useTypedResizeObserver(cellRef, entry => {
    const lines = Math.max(
      1,
      Math.floor((entry.contentRect.height - CELL_VERTICAL_PADDING_PX) / APPROX_LINE_HEIGHT_PX),
    );
    setMaxLines(lines);
  });

  return (
    <Box
      data-cy="scaled-cell-shell"
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        borderBottom: `1px solid ${theme.palette.border.darker}`,
        "& .hover-content": { visibility: "hidden" },
        "&:hover": {
          backgroundColor: theme.palette.background.grey,
          "& .hover-content": { visibility: "visible" },
        },
        ...sx,
      }}>
      <Stack
        ref={cellRef}
        sx={{
          height: "100%",
          padding: theme.spacing(1),
          minWidth: 0,
          minHeight: 0,
          overflow: "hidden",
          justifyContent: "center",
        }}>
        <Box
          ref={contentRef}
          sx={{
            display: "-webkit-box",
            WebkitLineClamp: maxLines,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
            overflowWrap: "anywhere",
            wordBreak: "break-word",
          }}>
          {children}
        </Box>
      </Stack>
      <Stack
        className="hover-content"
        sx={{
          position: "absolute",
          top: 0,
          right: 0,
          padding: theme.spacing(1),
          backgroundColor: theme.palette.background.grey,
          borderBottomLeftRadius: theme.spacing(0.5),
          zIndex: 1,
        }}>
        <StandaloneIconButton
          icon={<Copy />}
          dataCy="copyLayer-button"
          aria-label={t("copyToClipboard")}
          onClick={e => {
            e.stopPropagation();
            // The contentRef wraps the full children DOM, not the clamped projection — so the
            // copy payload always includes the truncated text, not just what's visible.
            const text = contentRef.current?.innerText ?? contentRef.current?.textContent ?? "";
            void copyToClipboard(text);
          }}
          color="primaryInverse"
          sx={{ backgroundColor: theme.palette.background.grey }}
        />
      </Stack>
    </Box>
  );
};
