import { FC, ReactNode, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Stack } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import { Copy } from "lucide-react";
import { theme } from "../../../../../../AppTheme.ts";
import { StandaloneIconButton } from "../../../../../../components/buttons/buttons.tsx";
import { useCopyToClipboard } from "../../../../../../hooks/useCopyToClipboard.ts";
import { approximateLineHeightPx, lineClampSx } from "../../components/stratigraphyTableConstants.ts";
import { useTypedResizeObserver } from "../../navigation/useTypedResizeObserver.ts";

// Preferred (spacious) and minimum (compressed) vertical padding, in px. The cell shrinks its
// padding toward the minimum before dropping the last line of text.
const maxVerticalPaddingPx = 8;
const minVerticalPaddingPx = 0;

interface ScaledCellShellProps {
  children: ReactNode;
  dataCy?: string;
  sx?: SxProps<Theme>;
}

export const ScaledCellShell: FC<ScaledCellShellProps> = ({ children, dataCy, sx }) => {
  const { t } = useTranslation();
  const copyToClipboard = useCopyToClipboard();
  const cellRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  // Generous initial value so the first paint doesn't aggressively clip content before the
  // ResizeObserver corrects to the real cell-derived line count.
  const [maxLines, setMaxLines] = useState(99);
  const [verticalPaddingPx, setVerticalPaddingPx] = useState(maxVerticalPaddingPx);

  // Extracts readable text from an element, joining each direct child's text with a line break.
  // Falls back to the element's flat textContent when there are no child elements.
  const extractCellText = (el: Element): string =>
    Array.from(el.children)
      .map(child => child.textContent?.trim())
      .filter(Boolean)
      .join("\n") ||
    el.textContent?.trim() ||
    "";

  // Recompute the clamp count and vertical padding whenever the cell's pixel height changes.
  // Padding scales down first (toward `minVerticalPaddingPx`) so a shrinking cell keeps showing
  // its text as long as at least one full line fits at minimum padding. Only when even the
  // compressed cell cannot fit a line does `maxLines` drop to 0 and the content get hidden,
  // which is better than showing a vertically-clipped half-line.
  useTypedResizeObserver(cellRef, () => {
    const el = cellRef.current;
    if (!el) return;
    const borderBoxHeightPx = el.offsetHeight;
    const lines = Math.floor((borderBoxHeightPx - 2 * minVerticalPaddingPx) / approximateLineHeightPx);
    if (lines <= 0) {
      setMaxLines(0);
      setVerticalPaddingPx(maxVerticalPaddingPx);
      return;
    }
    const slackPx = borderBoxHeightPx - lines * approximateLineHeightPx;
    const padding = Math.max(minVerticalPaddingPx, Math.min(maxVerticalPaddingPx, slackPx / 2));
    setMaxLines(lines);
    setVerticalPaddingPx(padding);
  });

  return (
    <Box
      data-cy={dataCy ?? "scaled-cell-shell"}
      sx={{
        position: "absolute",
        inset: 0,
        // Pull the cell 1px above its wrapper so its borderTop lands on the same pixel as the
        // cell-above's borderBottom — adjacent cells then render as a single 1px line instead of
        // a stacked 2px line. Adding borders to both top and bottom helps with correct gap display.
        top: "-1px",
        overflow: "hidden",
        backgroundColor: theme.palette.background.default,
        borderTop: `1px solid ${theme.palette.border.darker}`,
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
          paddingX: theme.spacing(1),
          paddingY: `${verticalPaddingPx}px`,
          minWidth: 0,
          minHeight: 0,
          overflow: "hidden",
          justifyContent: "center",
        }}>
        {maxLines > 0 && (
          <Box ref={contentRef} sx={lineClampSx(maxLines)}>
            {children}
          </Box>
        )}
      </Stack>
      {maxLines > 1 && (
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
              copyToClipboard(el ? extractCellText(el) : "");
            }}
            color="primaryInverse"
            sx={{ backgroundColor: theme.palette.background.grey }}
          />
        </Stack>
      )}
    </Box>
  );
};
