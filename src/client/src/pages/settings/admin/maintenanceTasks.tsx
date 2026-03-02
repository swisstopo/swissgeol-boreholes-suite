import { FC, ReactNode, useContext, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { GridColDef, GridRenderCellParams } from "@mui/x-data-grid";
import { FlaskConical, Info, Map, MapPin, ScrollText } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { de, enUS, fr, it } from "date-fns/locale";
import {
  MaintenanceTaskState,
  useMaintenanceLogs,
  useMaintenanceStatus,
  useStartMigration,
} from "../../../api/maintenance.ts";
import { AlertContext } from "../../../components/alert/alertContext.tsx";
import { BoreholesButton } from "../../../components/buttons/buttons.tsx";
import { Table } from "../../../components/table/table.tsx";

const dateFnsLocales: Record<string, Locale> = { de, en: enUS, fr, it };

const statusChipColorMap: Record<string, "default" | "info" | "success" | "error"> = {
  Idle: "default",
  Running: "info",
  Completed: "success",
  Failed: "error",
};

const statusLabelMap: Record<string, string> = {
  Idle: "taskIdle",
  Running: "taskRunning",
  Completed: "taskCompleted",
  Failed: "taskFailed",
};

const formatDuration = (startedAt: string, completedAt: string): string => {
  const ms = new Date(completedAt).getTime() - new Date(startedAt).getTime();
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}m ${remainingSeconds}s`;
};

// Map API task type values to their existing translation keys.
const taskTypeTranslationMap: Record<string, string> = {
  LocationMigration: "locationMigration",
  CoordinateMigration: "coordinateMigration",
};

interface MigrationCardConfig {
  taskType: string;
  title: string;
  description: string;
  hint?: string;
  icon: ReactNode;
  dataCyPrefix: string;
}

const migrationTasks: MigrationCardConfig[] = [
  {
    taskType: "LocationMigration",
    title: "locationMigration",
    description: "locationMigrationDescription",
    hint: "locationMigrationHint",
    icon: <Map size={24} />,
    dataCyPrefix: "location-migration",
  },
  {
    taskType: "CoordinateMigration",
    title: "coordinateMigration",
    description: "coordinateMigrationDescription",
    icon: <MapPin size={24} />,
    dataCyPrefix: "coordinate-migration",
  },
];

interface MigrationCardProps {
  config: MigrationCardConfig;
  taskState: MaintenanceTaskState | undefined;
}

const MigrationCard: FC<MigrationCardProps> = ({ config, taskState }) => {
  const { t } = useTranslation();
  const { showAlert } = useContext(AlertContext);
  const [onlyMissing, setOnlyMissing] = useState(true);
  const [dryRun, setDryRun] = useState(true);
  const [justStarted, setJustStarted] = useState(false);
  const mutation = useStartMigration(config.taskType);

  const status = taskState?.status ?? "Idle";
  const isRunning = status === "Running" || mutation.isPending || justStarted;
  const { title, description, hint, icon, dataCyPrefix } = config;

  // Clear the optimistic flag once the server status catches up.
  useEffect(() => {
    if (justStarted && status !== "Idle") {
      setJustStarted(false);
    }
  }, [justStarted, status]);

  const handleStart = () => {
    mutation.mutate(
      { onlyMissing, dryRun },
      {
        onSuccess: () => setJustStarted(true),
        onError: () => {
          setJustStarted(false);
          showAlert(t("taskFailed"), "error");
        },
      },
    );
  };

  return (
    <Card data-cy={`${dataCyPrefix}-card`}>
      <CardHeader
        title={
          <Stack direction="row" alignItems="center" gap={1}>
            {icon}
            {t(title)}
          </Stack>
        }
        action={
          <Chip
            label={t(isRunning ? "taskRunning" : "taskIdle")}
            size="small"
            color={isRunning ? "info" : "default"}
            variant="outlined"
          />
        }
        sx={{ p: 4, pb: 3 }}
        titleTypographyProps={{ variant: "h5" }}
      />
      <CardContent sx={{ pt: 4, px: 3 }}>
        <Typography variant="body1">{t(description)}</Typography>
        {hint && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {t(hint)}
          </Typography>
        )}
        <Stack direction="row" alignItems="center" gap={2} sx={{ mt: 2 }}>
          <FormControlLabel
            control={
              <Checkbox
                checked={onlyMissing}
                onChange={e => setOnlyMissing(e.target.checked)}
                data-cy={`${dataCyPrefix}-only-missing`}
              />
            }
            label={t("onlyMissing")}
          />
          <Box sx={{ flexGrow: 1 }} />
          <FormControlLabel
            control={
              <Checkbox
                checked={dryRun}
                onChange={e => setDryRun(e.target.checked)}
                data-cy={`${dataCyPrefix}-dry-run`}
              />
            }
            label={
              <Stack direction="row" alignItems="center" gap={0.5}>
                {t("dryRun")}
                <Tooltip title={t("dryRunExplanation")}>
                  <Info size={16} />
                </Tooltip>
              </Stack>
            }
          />
          <BoreholesButton
            label="startTask"
            variant="contained"
            disabled={isRunning}
            onClick={handleStart}
            dataCy={`${dataCyPrefix}-start`}
          />
        </Stack>
      </CardContent>
    </Card>
  );
};

const pageSize = 6;

const ExecutionLogTable: FC = () => {
  const { t, i18n } = useTranslation();
  const [page, setPage] = useState(0);
  const [includeDryRun, setIncludeDryRun] = useState(false);

  const { data, isLoading } = useMaintenanceLogs(page + 1, pageSize, includeDryRun);

  const rows = useMemo(() => data?.logEntries.map((entry, index) => ({ ...entry, id: index })) ?? [], [data]);

  const columns: GridColDef[] = useMemo(
    () => [
      {
        field: "taskType",
        headerName: t("taskType"),
        flex: 2,
        renderCell: (params: GridRenderCellParams) => (
          <Stack direction="row" alignItems="center" gap={0.5}>
            {t(taskTypeTranslationMap[params.value] ?? params.value)}
            {params.row.isDryRun && (
              <Tooltip title={t("dryRun")}>
                <FlaskConical size={16} />
              </Tooltip>
            )}
          </Stack>
        ),
      },
      {
        field: "status",
        headerName: t("status"),
        width: 120,
        resizable: false,
        renderCell: (params: GridRenderCellParams) => (
          <Chip
            label={t(statusLabelMap[params.value])}
            size="small"
            color={statusChipColorMap[params.value]}
            variant="outlined"
          />
        ),
      },
      {
        field: "affectedCount",
        headerName: t("affected"),
        width: 100,
        resizable: false,
        renderCell: (params: GridRenderCellParams) =>
          params.row.status === "Failed" ? (params.row.message ?? "-") : (params.value ?? 0),
      },
      {
        field: "startedByName",
        headerName: t("startedBy"),
        flex: 1.5,
        renderCell: (params: GridRenderCellParams) => params.value ?? "-",
      },
      {
        field: "duration",
        headerName: t("duration"),
        width: 100,
        resizable: false,
        renderCell: (params: GridRenderCellParams) => {
          const { startedAt, completedAt } = params.row;
          if (!startedAt || !completedAt) return "-";
          return formatDuration(startedAt, completedAt);
        },
      },
      {
        field: "completedAt",
        headerName: t("completed"),
        flex: 1.5,
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
          label={
            <Stack direction="row" alignItems="center" gap={0.5}>
              <FlaskConical size={16} />
              {t("showDryRuns")}
            </Stack>
          }
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

export const MaintenanceTasks: FC = () => {
  const { data: taskStates } = useMaintenanceStatus();

  return (
    <Stack direction="row" gap={3} pb={3}>
      <Stack spacing={3} sx={{ flex: 1, minWidth: 0 }}>
        {migrationTasks.map(config => (
          <MigrationCard
            key={config.taskType}
            config={config}
            taskState={taskStates?.find(s => s.type === config.taskType)}
          />
        ))}
      </Stack>
      <Divider orientation="vertical" flexItem />
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <ExecutionLogTable />
      </Box>
    </Stack>
  );
};
