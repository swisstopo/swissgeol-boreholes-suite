import { FC, ReactNode, useContext, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Box,
  Card,
  CardContent,
  CardHeader,
  Checkbox,
  Chip,
  FormControlLabel,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import { Info } from "lucide-react";
import { MaintenanceTaskState, MaintenanceTaskType, useStartMigration } from "../../../api/maintenance.ts";
import { AlertContext } from "../../../components/alert/alertContext.tsx";
import { BoreholesButton } from "../../../components/buttons/buttons.tsx";

export interface MigrationCardConfig {
  taskType: MaintenanceTaskType;
  title: string;
  description: string;
  hint?: string;
  icon: ReactNode;
  dataCyPrefix: string;
}

interface MigrationCardProps {
  config: MigrationCardConfig;
  taskState: MaintenanceTaskState | undefined;
}

export const MigrationCard: FC<MigrationCardProps> = ({ config, taskState }) => {
  const { t } = useTranslation();
  const { showAlert } = useContext(AlertContext);
  const [onlyMissing, setOnlyMissing] = useState(true);
  const [dryRun, setDryRun] = useState(true);
  const [justStarted, setJustStarted] = useState(false);
  const { mutate: startMigration, isPending } = useStartMigration(config.taskType);

  const status = taskState?.status ?? "Idle";
  const isRunning = status === "Running" || isPending || justStarted;
  const { title, description, hint, icon, dataCyPrefix } = config;

  // Clear the optimistic flag once the server status catches up.
  useEffect(() => {
    if (justStarted && status !== "Idle") {
      setJustStarted(false);
    }
  }, [justStarted, status]);

  const handleStart = () => {
    startMigration(
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
        slotProps={{ title: { variant: "h5" } }}
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
            label={
              <Stack direction="row" alignItems="center" gap={0.5}>
                {t("onlyMissing")}
                <Tooltip title={t("onlyMissingExplanation")}>
                  <Info size={16} />
                </Tooltip>
              </Stack>
            }
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
