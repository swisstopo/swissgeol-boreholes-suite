import { FC } from "react";
import { Box, Divider, Stack } from "@mui/material";
import { useMaintenanceStatus } from "../../../api/maintenance.ts";
import { ExecutionLogTable } from "./executionLogTable.tsx";
import { MigrationCard, MigrationCardConfig } from "./migrationCard.tsx";

const migrationTasks: MigrationCardConfig[] = [
  {
    taskType: "LocationMigration",
    title: "locationMigration",
    description: "locationMigrationDescription",
    hint: "locationMigrationHint",
    dataCyPrefix: "location-migration",
  },
  {
    taskType: "CoordinateMigration",
    title: "coordinateMigration",
    description: "coordinateMigrationDescription",
    dataCyPrefix: "coordinate-migration",
  },
];

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
