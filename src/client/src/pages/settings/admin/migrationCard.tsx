import { FC, useContext, useState } from "react";
import { useTranslation } from "react-i18next";
import { Box, Checkbox, Chip, FormControlLabel, Stack, Tooltip, Typography } from "@mui/material";
import { Info } from "lucide-react";
import { ApiError } from "../../../api/apiInterfaces.ts";
import { MaintenanceTaskState, MaintenanceTaskType, useStartMigration } from "../../../api/maintenance.ts";
import { AlertContext } from "../../../components/alert/alertContext.tsx";
import { BoreholesCard } from "../../../components/boreholesCard.tsx";
import { BoreholesButton } from "../../../components/buttons/buttons.tsx";

export interface MigrationCardConfig {
  taskType: MaintenanceTaskType;
  title: string;
  description: string;
  hint?: string;
  dataCyPrefix: string;
  showOnlyMissing?: boolean;
}

interface MigrationCardProps {
  config: MigrationCardConfig;
  taskState: MaintenanceTaskState | undefined;
}

export const MigrationCard: FC<MigrationCardProps> = ({ config, taskState }) => {
  const { t } = useTranslation();
  const { showAlert } = useContext(AlertContext);
  const showOnlyMissing = config.showOnlyMissing !== false;
  const [onlyMissing, setOnlyMissing] = useState(showOnlyMissing);
  const [dryRun, setDryRun] = useState(true);
  const { mutate: startMigration, isPending } = useStartMigration(config.taskType);

  const status = taskState?.status ?? "Idle";
  const isRunning = status === "Running" || isPending;
  const { title, description, hint, dataCyPrefix } = config;

  const handleStart = () => {
    startMigration(
      { onlyMissing, dryRun },
      {
        onError: error => {
          if (error instanceof ApiError && error.status === 409) {
            showAlert(t("taskAlreadyRunning"), "error");
          } else {
            showAlert(t("taskFailed"), "error");
          }
        },
      },
    );
  };

  return (
    <BoreholesCard
      data-cy={`${dataCyPrefix}-card`}
      title={t(title)}
      action={
        <Chip
          label={t(isRunning ? "taskRunning" : "taskIdle")}
          size="small"
          color={isRunning ? "info" : "default"}
          variant="outlined"
        />
      }>
      <Typography variant="body1">{t(description)}</Typography>
      {hint && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          {t(hint)}
        </Typography>
      )}
      <Stack direction="row" alignItems="center" gap={2} sx={{ mt: 2 }}>
        {showOnlyMissing && (
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
        )}
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
    </BoreholesCard>
  );
};
