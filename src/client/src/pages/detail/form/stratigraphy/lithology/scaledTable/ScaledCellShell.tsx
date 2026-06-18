import { FC, ReactNode, useLayoutEffect, useRef, useState } from "react";
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

// Visual shell that wraps each scaled lithology cell.
export const ScaledCellShell: FC<ScaledCellShellProps> = ({ children, sx }) => {
  const { t } = useTranslation();
  const copyToClipboard = useCopyToClipboard();
  const contentRef = useRef<HTMLDivElement>(null);
  const [isOverflowing, setIsOverflowing] = useState(false);

  // Cell heights change as the user zooms, so re-measure overflow whenever the content box resizes.
  // Centering looks right when content fits; falls back to flex-start so the start of long
  // descriptions stays visible at high zoom-out levels.
  const measure = () => {
    const el = contentRef.current;
    if (el) setIsOverflowing(el.scrollHeight > el.clientHeight);
  };
  useLayoutEffect(measure, [children]);
  useTypedResizeObserver(contentRef, measure);

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
        ref={contentRef}
        gap={1}
        sx={{
          height: "100%",
          padding: theme.spacing(1),
          minWidth: 0,
          minHeight: 0,
          overflow: "hidden",
          justifyContent: isOverflowing ? "flex-start" : "center",
          overflowWrap: "anywhere",
          wordBreak: "break-word",
        }}>
        {children}
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
