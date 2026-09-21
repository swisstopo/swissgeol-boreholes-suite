import { FC, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  IconButton,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography,
} from "@mui/material";
import { Check, RotateCcw, TriangleAlert } from "lucide-react";
import { theme } from "../../../../../../AppTheme.ts";
import { FieldChangeSummary } from "../../../../../../components/form/fieldAnalysis/fieldAnalysisAdornments.tsx";
import { PromptContext } from "../../../../../../components/prompt/promptContext.tsx";
import { LithologyAnalysis } from "./useLithologyAnalysis.ts";

interface AnalysisResultCardProps {
  analysis: LithologyAnalysis;
}

const modeLabelKey = (mode: boolean | null): string => {
  if (mode === true) return "unconsolidated";
  if (mode === false) return "consolidated";
  return "unspecified";
};

/**
 * Documents what the automatic classification changed and lets the user take it back, per field or
 * as a whole. The card stays visible while a mode change is pending even after every field row is
 * resolved, because it is the only way back to the values of the mode that was left.
 */
export const AnalysisResultCard: FC<AnalysisResultCardProps> = ({ analysis }) => {
  const { t } = useTranslation();
  const { showPrompt } = useContext(PromptContext);
  const [isAscending, setIsAscending] = useState(true);

  const rows = useMemo(() => {
    const changes = [...analysis.changeByPath.values()];
    return isAscending ? changes : [...changes].reverse();
  }, [analysis.changeByPath, isAscending]);

  if (!analysis.hasPendingChanges) return null;

  const confirmAcceptAll = () => {
    showPrompt("analysisAcceptAllConfirm", [
      { label: "cancel", action: () => {} },
      { label: "acceptValues", variant: "contained", action: analysis.acceptAll },
    ]);
  };

  return (
    <Box data-cy="analysis-result-card" sx={{ mt: 2 }}>
      <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h6">{t("analysis")}</Typography>
        <Stack direction="row" gap={1}>
          <Button
            variant="text"
            data-cy="analysis-reset-all"
            startIcon={<RotateCcw size={16} />}
            onClick={analysis.resetAll}>
            {t("analysisResetAll")}
          </Button>
          <Button
            variant="text"
            data-cy="analysis-accept-all"
            startIcon={<Check size={16} />}
            onClick={confirmAcceptAll}>
            {t("analysisAcceptAll")}
          </Button>
        </Stack>
      </Stack>

      {analysis.modeChange && (
        <Stack
          direction="row"
          gap={1}
          alignItems="center"
          data-cy="analysis-mode-change"
          sx={{
            p: 1.5,
            mb: 1,
            borderRadius: 1,
            backgroundColor: theme.palette.ai.highlightBackground,
            border: `1px solid ${theme.palette.ai.highlightBorder}`,
          }}>
          <Stack direction="row" gap={0.5} alignItems="center" sx={{ color: theme.palette.warning.main }}>
            <TriangleAlert size={16} />
            <Typography variant="body2" sx={{ fontWeight: 500 }}>
              {t("modeSwitched")}
            </Typography>
          </Stack>
          <Typography variant="body2" sx={{ textDecoration: "line-through" }}>
            {t(modeLabelKey(analysis.modeChange.previous))}
          </Typography>
          <Typography variant="body2">{"→"}</Typography>
          <Typography variant="body2">{t(modeLabelKey(analysis.modeChange.next))}</Typography>
        </Stack>
      )}

      {rows.length > 0 && (
        <Table size="small" sx={{ backgroundColor: theme.palette.background.default }}>
          <TableHead sx={{ backgroundColor: theme.palette.background.grey }}>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active
                  direction={isAscending ? "asc" : "desc"}
                  data-cy="analysis-sort-attribute"
                  onClick={() => setIsAscending(!isAscending)}>
                  {t("attribute")}
                </TableSortLabel>
              </TableCell>
              <TableCell>{t("change")}</TableCell>
              <TableCell align="right" />
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(change => (
              <TableRow key={change.path} data-cy={`${change.path}-analysis-row`}>
                <TableCell>{t(change.labelKey)}</TableCell>
                <TableCell>
                  <FieldChangeSummary change={change} />
                </TableCell>
                <TableCell align="right">
                  <Stack direction="row" gap={0.5} justifyContent="flex-end">
                    <Tooltip title={t("reset")}>
                      <IconButton
                        size="small"
                        data-cy={`${change.path}-analysis-row-reset`}
                        onClick={() => analysis.resetField(change.path)}>
                        <RotateCcw size={16} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title={t("accept")}>
                      <IconButton
                        size="small"
                        data-cy={`${change.path}-analysis-row-accept`}
                        onClick={() => analysis.acceptField(change.path)}>
                        <Check size={16} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Box>
  );
};
