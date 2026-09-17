import { FC } from "react";
import { useTranslation } from "react-i18next";
import { IconButton, LinearProgress, Stack, Typography } from "@mui/material";
import { X } from "lucide-react";
import { theme } from "../../../../../AppTheme.ts";
import { uploadProgressHint } from "../uploadProgressText.ts";

interface ImportUploadProgressProps {
  fileName: string;
  current: number;
  count: number;
  transferred: number;
  onCancel: () => void;
  total?: number;
}

/**
 * The percentage to show on the bar, or `undefined` to fall back to an indeterminate bar.
 *
 * A `total` of 0 is a real zero-byte file rather than an unknown size, but dividing by it would
 * hand `NaN` to `LinearProgress`, so it is treated the same as an unknown total.
 */
const progressPercent = (transferred: number, total?: number): number | undefined =>
  total ? Math.min(100, Math.max(0, (transferred / total) * 100)) : undefined;

/**
 * Tells the user which attachment is on the wire while the report stays readable underneath.
 *
 * A dimming backdrop is deliberately not used here: the report is shown before the uploads
 * finish so it can be read while they run.
 */
export const ImportUploadProgress: FC<ImportUploadProgressProps> = ({
  fileName,
  current,
  count,
  transferred,
  onCancel,
  total,
}) => {
  const { t } = useTranslation();
  const percent = progressPercent(transferred, total);
  const hint = uploadProgressHint(t, { current, count, transferred, total });

  return (
    <Stack
      data-cy="import-upload-progress"
      gap={0.5}
      sx={{
        px: 2,
        py: 1.5,
        borderRadius: theme.spacing(0.5),
        border: `1px solid ${theme.palette.border.light}`,
        backgroundColor: theme.palette.background.default,
      }}>
      <Stack direction="row" alignItems="center" gap={1}>
        <Typography variant="body2" sx={{ fontWeight: 500, flexGrow: 1, overflowWrap: "anywhere" }}>
          {t("uploadingFile", { name: fileName })}
        </Typography>
        <IconButton size="small" aria-label={t("cancel")} data-cy="import-upload-cancel" onClick={onCancel}>
          <X size={18} />
        </IconButton>
      </Stack>
      <LinearProgress variant={percent === undefined ? "indeterminate" : "determinate"} value={percent} />
      <Typography variant="subtitle2" sx={{ fontVariantNumeric: "tabular-nums" }}>
        {hint}
      </Typography>
    </Stack>
  );
};
