import { FC, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Checkbox, Chip, FormControlLabel, Stack, Tooltip, Typography } from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { CheckIcon, ScrollText } from "lucide-react";
import { formatDistanceToNow, formatDuration, intervalToDuration } from "date-fns";
import { de, enUS, fr, it } from "date-fns/locale";
import { MaintenanceTaskStatus, MaintenanceTaskType, useMaintenanceLogs } from "../../../api/maintenance.ts";
import { Table } from "../../../components/table/table.tsx";

type LogStatus = Extract<MaintenanceTaskStatus, "Completed" | "Failed">;

const dateFnsLocales: Record<string, Locale> = { de, en: enUS, fr, it };

const statusChipColorMap: Record<LogStatus, "success" | "error"> = {
  Completed: "success",
  Failed: "error",
};

const statusLabelMap: Record<LogStatus, string> = {
  Completed: "taskCompleted",
  Failed: "taskFailed",
};

// Map API task type values to their existing translation keys.
const taskTypeTranslationMap: Record<MaintenanceTaskType, string> = {
  LocationMigration: "locationMigration",
  CoordinateMigration: "coordinateMigration",
  UserMerge: "userMerge",
};

export const ExecutionLogTable: FC = () => {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(0);
  const [includeDryRun, setIncludeDryRun] = useState(false);

  const { data, isLoading } = useMaintenanceLogs(page + 1, includeDryRun);
  const pageSize = data?.pageSize ?? 10;

  const rows = useMemo(() => data?.logEntries.map((entry, index) => ({ ...entry, id: index })) ?? [], [data]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "taskType",
        headerName: t("taskType"),
        flex: 2.5,
        renderCell: (params: GridRenderCellParams) =>
          t(taskTypeTranslationMap[params.value as MaintenanceTaskType] ?? params.value),
      },
      {
        field: "isDryRun",
        headerName: t("dryRun"),
        flex: 1.5,
        renderCell: (params: GridRenderCellParams) => (params.value ? <CheckIcon size={16} /> : null),
      },
      {
        field: "status",
        headerName: t("status"),
        flex: 1.5,
        renderCell: (params: GridRenderCellParams) => (
          <Chip
            label={t(statusLabelMap[params.value as LogStatus] ?? params.value)}
            size="small"
            color={statusChipColorMap[params.value as LogStatus] ?? "default"}
            variant="outlined"
          />
        ),
      },
      {
        field: "affectedCount",
        headerName: t("affected"),
        flex: 1,
        renderCell: (params: GridRenderCellParams) =>
          params.row.status === "Failed" ? (params.row.message ?? "-") : (params.value ?? 0),
      },
      {
        field: "startedByName",
        headerName: t("startedBy"),
        flex: 2,
        renderCell: (params: GridRenderCellParams) => params.value ?? "-",
      },
      {
        field: "duration",
        headerName: t("duration"),
        flex: 1.5,
        renderCell: (params: GridRenderCellParams) => {
          const { startedAt, completedAt } = params.row;
          if (!startedAt || !completedAt) return "-";
          const duration = intervalToDuration({ start: new Date(startedAt), end: new Date(completedAt) });
          return (
            formatDuration(duration, {
              format: ["hours", "minutes", "seconds"],
              locale: dateFnsLocales[i18n.language],
            }) || "< 1s"
          );
        },
      },
      {
        field: "completedAt",
        headerName: t("completed"),
        flex: 2,
        renderCell: (params: GridRenderCellParams) => {
          const text = formatDistanceToNow(new Date(params.value), {
            addSuffix: true,
            locale: dateFnsLocales[i18n.language],
          });
          return (
            <Tooltip title={text}>
              <Box sx={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{text}</Box>
            </Tooltip>
          );
        },
      },
    ],
    [t, i18n.language],
  );

  return (
    <Box data-cy="execution-log-section">
      <Stack direction="row" alignItems="center" justifyContent="space-between">
        <Stack direction="row" alignItems="center" gap={1}>
          <ScrollText size={24} />
          <Typography variant="h5">{t("lastExecutions")}</Typography>
        </Stack>
        <FormControlLabel
          control={
            <Checkbox
              checked={includeDryRun}
              onChange={e => {
                setIncludeDryRun(e.target.checked);
                setPage(0);
              }}
              data-cy="execution-log-include-dry-run"
            />
          }
          label={t("showDryRuns")}
        />
      </Stack>
      <Table
        rows={rows}
        columns={columns}
        paginationMode="server"
        rowCount={data?.totalCount ?? 0}
        paginationModel={{ page, pageSize }}
        onPaginationModelChange={model => setPage(model.page)}
        maxRowsPerPage={pageSize}
        isLoading={isLoading}
        dataCy="execution-log-table"
        showQuickFilter={false}
        disableColumnSorting
      />
    </Box>
  );
};
