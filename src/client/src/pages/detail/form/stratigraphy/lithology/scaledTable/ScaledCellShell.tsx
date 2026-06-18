import { FC, ReactNode, useRef } from "react";
import { useTranslation } from "react-i18next";
import { Box, Stack } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import { Copy } from "lucide-react";
import { theme } from "../../../../../../AppTheme.ts";
import { StandaloneIconButton } from "../../../../../../components/buttons/buttons.tsx";
import { useCopyToClipboard } from "../../../../../../hooks/useCopyToClipboard.ts";

interface ScaledCellShellProps {
  children: ReactNode;
  sx?: SxProps<Theme>;
}

// Visual shell that wraps each scaled lithology cell. Mirrors the edit-mode StratigraphyTableActionCell:
// same hover-revealed copy button anchored to the top-right corner, same `.hover-content` CSS toggle,
// same StandaloneIconButton styling, and the same innerText-of-content copy payload so a user pastes
// exactly what they see on screen.
export const ScaledCellShell: FC<ScaledCellShellProps> = ({ children, sx }) => {
  const { t } = useTranslation();
  const copyToClipboard = useCopyToClipboard();
  const contentRef = useRef<HTMLDivElement>(null);

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
