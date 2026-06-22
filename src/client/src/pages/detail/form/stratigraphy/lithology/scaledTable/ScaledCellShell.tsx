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
  dataCy?: string;
  sx?: SxProps<Theme>;
}

// Vertical padding consumed by the outer Stack (theme.spacing(1) top + bottom = 16px).
const CELL_VERTICAL_PADDING_PX = 16;
// Approximate body1/body2 line height (~16-14px font × ~1.5 leading). Used to compute how many
// whole lines fit so -webkit-line-clamp cuts on a line boundary instead of mid-glyph.
const APPROX_LINE_HEIGHT_PX = 24;

export const ScaledCellShell: FC<ScaledCellShellProps> = ({ children, dataCy, sx }) => {
  const { t } = useTranslation();
  const copyToClipboard = useCopyToClipboard();
  const cellRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // Generous initial value so the first paint doesn't aggressively clip content before the
  // ResizeObserver corrects to the real cell-derived line count.
  const [maxLines, setMaxLines] = useState(99);

  // Recompute the clamp count whenever the cell's pixel height changes (zoom in/out, pan,
  // initial calibration). Clamping at a whole-line boundary prevents the half-cut bottom line
  // that plain overflow:hidden produces, and the ellipsis is rendered by the browser.
  useTypedResizeObserver(cellRef, entry => {
    const lines = Math.max(
      1,
      Math.floor((entry.contentRect.height - CELL_VERTICAL_PADDING_PX) / APPROX_LINE_HEIGHT_PX),
    );
    setMaxLines(lines);
  });

  return (
    <Box
      data-cy={dataCy ?? "scaled-cell-shell"}
      sx={{
        position: "absolute",
        inset: 0,
        overflow: "hidden",
        backgroundColor: theme.palette.background.default,
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
            // -webkit-box layout drops the normal gap a flex Stack would give Typography
            // siblings; restore the spacing so multi-block content reads like in edit-mode.
            "& > *:not(:first-child)": {
              marginTop: theme.spacing(1),
            },
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
          onPointerDown={e => e.stopPropagation()}
          onClick={e => {
            e.stopPropagation();
            const el = contentRef.current;
            copyToClipboard((el?.innerText ?? el?.textContent ?? "").trim());
          }}
          color="primaryInverse"
          sx={{ backgroundColor: theme.palette.background.grey }}
        />
      </Stack>
    </Box>
  );
};
