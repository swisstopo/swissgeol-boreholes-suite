import { FC, useContext, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Button, IconButton, Stack, Tooltip, Typography } from "@mui/material";
import { GridColDef, GridRowId, GridSortModel } from "@mui/x-data-grid";
import { Check, Info, RotateCcw } from "lucide-react";
import { theme } from "../../../../../../AppTheme.ts";
import { FieldChange } from "../../../../../../components/form/fieldAnalysis/fieldAnalysis.ts";
import { FieldChangeSummary } from "../../../../../../components/form/fieldAnalysis/fieldAnalysisAdornments.tsx";
import { ValueChange } from "../../../../../../components/form/fieldAnalysis/valueChange.tsx";
import { PromptContext } from "../../../../../../components/prompt/promptContext.tsx";
import { Table } from "../../../../../../components/table/table.tsx";
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
  const { acceptField, resetField } = analysis;
  const [sortModel, setSortModel] = useState<GridSortModel>([{ field: "labelKey", sort: "asc" }]);

  const rows = useMemo(() => [...analysis.changeByPath.values()], [analysis.changeByPath]);

  const columns = useMemo<GridColDef<FieldChange>[]>(() => {
    const analysisPosition = (id: GridRowId) => rows.findIndex(change => change.path === id);

    return [
      {
        field: "labelKey",
        headerName: t("attribute"),
        valueGetter: (_, change) => t(change.labelKey),
        // The rows keep the order the analysis reported them in, sorting only reverses it.
        sortComparator: (_first, _second, firstCell, secondCell) =>
          analysisPosition(firstCell.id) - analysisPosition(secondCell.id),
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
              <IconButton size="small" data-cy={`${row.path}-analysis-row-reset`} onClick={() => resetField(row.path)}>
                <RotateCcw size={16} />
              </IconButton>
            </Tooltip>
            <Tooltip title={t("accept")}>
              <IconButton
                size="small"
                data-cy={`${row.path}-analysis-row-accept`}
                onClick={() => acceptField(row.path)}>
                <Check size={16} />
              </IconButton>
            </Tooltip>
          </Stack>
        ),
      },
    ];
  }, [acceptField, resetField, rows, t]);

  if (!analysis.hasPendingChanges) return null;

  const confirmAcceptAll = () => {
    showPrompt("analysisAcceptAllConfirm", [
      { label: "cancel", action: () => {} },
      { label: "acceptValues", variant: "contained", action: analysis.acceptAll },
    ]);
  };

  return (
    <Stack
      data-cy="analysis-result-card"
      gap={2}
      sx={{
        mt: 2,
        p: 3,
        backgroundColor: theme.palette.background.fileDropzoneSelected,
        border: `1px solid ${theme.palette.border.fileDropzoneSelected}`,
        borderRadius: theme.spacing(0.5),
      }}>
      <Stack direction="row" gap={2} justifyContent="space-between" alignItems="center" sx={{ mb: 1 }}>
        <Typography variant="h5">{t("analysis")}</Typography>
        <Stack direction="row" gap={1}>
          <Button
            variant="text"
            sx={{ backgroundColor: theme.palette.background.fileDropzoneSelected }}
            data-cy="analysis-reset-all"
            startIcon={<RotateCcw size={16} />}
            onClick={analysis.resetAll}>
            {t("analysisResetAll")}
          </Button>
          <Button
            variant="outlined"
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
            mb: 1,
            p: 2,
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
