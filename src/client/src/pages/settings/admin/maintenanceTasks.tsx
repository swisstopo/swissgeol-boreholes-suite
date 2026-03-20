import { FC } from "react";
import { Box, Stack } from "@mui/material";
import { useMaintenanceStatus } from "../../../api/maintenance.ts";
import { ExecutionLogTable } from "./executionLogTable.tsx";
import { MaintenanceTaskCard, MaintenanceTaskCardConfig } from "./maintenanceTaskCard.tsx";

const maintenanceTaskConfigs: MaintenanceTaskCardConfig[] = [
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

const allTasks: MaintenanceTaskCardConfig[] = [
  ...maintenanceTaskConfigs,
  {
    taskType: "UserMerge",
    title: "userMerge",
    description: "userMergeDescription",
    dataCyPrefix: "user-merge",
    showOnlyMissing: false,
  },
];

export const MaintenanceTasks: FC = () => {
  const { data: taskStates } = useMaintenanceStatus();

  return (
    <Stack spacing={3} pb={3}>
      <Stack direction="row" gap={3} sx={{ flexWrap: "wrap" }}>
        {allTasks.map(config => (
          <Box key={config.taskType} sx={{ flex: "1 1 450px", display: "flex" }}>
            <MaintenanceTaskCard config={config} taskState={taskStates?.find(s => s.type === config.taskType)} />
          </Box>
        ))}
      </Stack>
      <ExecutionLogTable />
    </Stack>
  );
};
