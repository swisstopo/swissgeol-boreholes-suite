import { FC, useCallback, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { GridColDef, GridSortModel } from "@mui/x-data-grid";
import { Check, Info, RotateCcw, X } from "lucide-react";
import { theme } from "../../../../../../AppTheme.ts";
import { BoreholesButton } from "../../../../../../components/buttons/buttons.tsx";
import { FieldChange } from "../../../../../../components/form/fieldAnalysis/fieldAnalysis.ts";
import { FieldChangeSummary } from "../../../../../../components/form/fieldAnalysis/fieldAnalysisAdornments.tsx";
import { ValueChange } from "../../../../../../components/form/fieldAnalysis/valueChange.tsx";
import { PromptContext } from "../../../../../../components/prompt/promptContext.tsx";
import { Table } from "../../../../../../components/table/table.tsx";
import { modeLabelKey } from "./classificationMapping.ts";
import { useConfirmModeChange } from "./useConfirmModeChange.tsx";
import { EmptyAnalysisResult, LithologyAnalysis } from "./useLithologyAnalysis.ts";

interface AnalysisResultCardProps {
  analysis: LithologyAnalysis;
}

const cardFrameSx = {
  mt: 2,
  p: 3,
  backgroundColor: theme.palette.background.fileDropzoneSelected,
  border: `1px solid ${theme.palette.border.fileDropzoneSelected}`,
  borderRadius: theme.spacing(0.5),
};

const emptyResultMessageKey: Record<EmptyAnalysisResult, string> = {
  nothingRecognized: "analysisNothingRecognized",
  nothingNew: "analysisNothingNew",
};

/**
 * Lists what the automatic classification changed and lets the user undo it, per field or all at once.
 *
 * When the classification switched the mode, the card stays open after the last field row is gone,
 * as long as no row was accepted: "Reset all" is then the only way to get back the values of the
 * previous mode, which the switch cleared. Accepting a row makes the switch final, so from then on
 * the card closes with its last row.
 *
 * A classification that changed nothing gets the card too, saying why, until the user closes it.
 */
export const AnalysisResultCard: FC<AnalysisResultCardProps> = ({ analysis }) => {
  const { t } = useTranslation();
  const { showPrompt } = useContext(PromptContext);
  const { acceptField, resetField, modeChange, isModeChangeFixed } = analysis;
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: "labelKey", sort: "asc" }]);

  const rows = useMemo(() => [...analysis.changeByPath.values()], [analysis.changeByPath]);

  // The first accepted row makes the mode change final, so the user confirms losing the values of
  // the mode that was left before it happens.
  const confirmModeChange = useConfirmModeChange(modeChange, isModeChangeFixed);
  const confirmAcceptField = useCallback(
    (path: string) => confirmModeChange(() => acceptField(path)),
    [acceptField, confirmModeChange],
  );

  const columns = useMemo<GridColDef<FieldChange>[]>(
    () => [
      {
        field: "labelKey",
        headerName: t("attribute"),
        valueGetter: (_, change) => t(change.labelKey),
      },
      {
        field: "change",
        headerName: t("change"),
        sortable: false,
        renderCell: ({ row }) => <FieldChangeSummary change={row} />,
      },
      {
        field: "actions",
        headerName: "",
        width: 88,
        align: "right",
        resizable: false,
        sortable: false,
        renderCell: ({ row }) => (
          <Stack direction="row" gap={0.5}>
            <Tooltip title={t("reset")}>
              <IconButton
                size="small"
                sx={{ color: "primary.main" }}
                data-cy={`${row.path}-analysis-row-reset`}
                onClick={() => resetField(row.path)}>
                <RotateCcw size={16} />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("accept")}>
              <IconButton
                size="small"
                sx={{ color: "primary.main" }}
                data-cy={`${row.path}-analysis-row-accept`}
                onClick={() => confirmAcceptField(row.path)}>
                <Check size={16} />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ],
    [confirmAcceptField, resetField, t],
  );

  if (analysis.emptyResult) {
    return (
      <Stack data-cy="analysis-empty-result" gap={2} sx={cardFrameSx}>
        <Stack direction="row" gap={2} justifyContent="space-between" alignItems="center">
          <Typography variant="h5">{t("analysis")}</Typography>
          <IconButton
            size="small"
            sx={{ color: "primary.main" }}
            aria-label={t("close")}
            data-cy="analysis-empty-result-close"
            onClick={analysis.dismissEmptyResult}>
            <X size={16} />
          </IconButton>
        </Stack>
        <Typography>{t(emptyResultMessageKey[analysis.emptyResult])}</Typography>
      </Stack>
    );
  }

  if (!analysis.hasPendingChanges) return null;

  const confirmAcceptAll = () => {
    showPrompt("analysisAcceptAllConfirm", [
      { label: "cancel", action: () => {} },
      { label: "acceptValues", variant: "contained", action: analysis.acceptAll },
    ]);
  };

  return (
    <Stack data-cy="analysis-result-card" gap={2} sx={cardFrameSx}>
      <Stack direction="row" gap={2} justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h5">{t("analysis")}</Typography>
        <Stack direction="row" gap={1}>
          <BoreholesButton
            variant="text"
            sx={{ backgroundColor: theme.palette.background.fileDropzoneSelected }}
            data-cy="analysis-reset-all"
            startIcon={<RotateCcw size={16} />}
            onClick={analysis.resetAll}
            label={t("analysisResetAll")}/>
          <BoreholesButton
            variant="outlined"
            data-cy="analysis-accept-all"
            startIcon={<Check size={16} />}
            onClick={confirmAcceptAll}
            label={t("analysisAcceptAll")}/>
        </Stack>
      </Stack>

      {analysis.modeChange && (
        <Stack
          direction="row"
          gap={1}
          alignItems="center"
          data-cy="analysis-mode-change"
          sx={{
            mb: 1,
            p: 3,
            borderRadius: 1,
            backgroundColor: theme.palette.ai.highlightBackground,
            border: `1px solid ${theme.palette.ai.highlightBorder}`,
          }}>
          <Stack
            direction="row"
            gap={0.5}
            alignItems="center"
            sx={{
              py: 0.5,
              px: 1,
              borderRadius: theme.spacing(10),
              color: theme.palette.secondary.main,
              backgroundColor: theme.palette.ai.secondary,
            }}>
            <Info size={12} />
            <Typography variant="h6" sx={{ fontWeight: 700, color: theme.palette.secondary.main }}>
              {t("modeSwitched")}
            </Typography>
          </Stack>
          <ValueChange
            previous={t(modeLabelKey(analysis.modeChange.previous))}
            next={t(modeLabelKey(analysis.modeChange.next))}
          />
        </Stack>
      )}

      {rows.length > 0 && (
        <Table<FieldChange>
          rows={rows}
          columns={columns}
          getRowId={change => change.path}
          sortModel={sortModel}
          onSortModelChange={setSortModel}
          showQuickFilter={false}
          rowAutoHeight
          dataCy="analysis-table"
          sx={{ backgroundColor: theme.palette.background.default }}
        />
      )}
    </Stack>
  );
};
