import { FC, ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { Box, Tooltip } from "@mui/material";
import { SxProps, Theme } from "@mui/material/styles";
import { Copy } from "lucide-react";
import { theme } from "../../../../../../AppTheme.ts";
import { StandaloneIconButton } from "../../../../../../components/buttons/buttons.tsx";
import { useCopyToClipboard } from "../../../../../../hooks/useCopyToClipboard.ts";

interface ScaledCellShellProps {
  copyText: string;
  children: ReactNode;
  sx?: SxProps<Theme>;
}

// Visual shell that surrounds each scaled lithology cell. The parent ScaledLayerColumn positions
// and sizes the wrapper; this shell fills it, clips overflow, shows the full text in a tooltip on
// hover, and reveals a copy-to-clipboard button via the CSS-only hover convention used elsewhere in
// the stratigraphy table (matches StratigraphyTableActionCell).
export const ScaledCellShell: FC<ScaledCellShellProps> = ({ copyText, children, sx }) => {
  const { t } = useTranslation();
  const copyToClipboard = useCopyToClipboard();

  return (
    <Box
      data-cy="scaled-cell-shell"
      sx={{
        position: "absolute",
        inset: 0,
        padding: theme.spacing(1),
        overflow: "hidden",
        borderBottom: `1px solid ${theme.palette.border.darker}`,
        "& .scaled-cell-hover": { visibility: "hidden" },
        "&:hover": {
          backgroundColor: theme.palette.background.grey,
          "& .scaled-cell-hover": { visibility: "visible" },
        },
        ...sx,
      }}>
      <Tooltip title={copyText} placement="left" enterDelay={500}>
        <Box sx={{ height: "100%", overflow: "hidden" }}>{children}</Box>
      </Tooltip>
      <Box
        className="scaled-cell-hover"
        sx={{
          position: "absolute",
          top: theme.spacing(0.5),
          right: theme.spacing(0.5),
          backgroundColor: theme.palette.background.grey,
          borderRadius: theme.spacing(0.5),
          zIndex: 1,
        }}>
        <StandaloneIconButton
          icon={<Copy />}
          dataCy="copyLayer-button"
          aria-label={t("copyToClipboard")}
          onClick={e => {
            e.stopPropagation();
            void copyToClipboard(copyText);
          }}
          color="primaryInverse"
          sx={{ backgroundColor: theme.palette.background.grey }}
        />
      </Box>
    </Box>
  );
};
