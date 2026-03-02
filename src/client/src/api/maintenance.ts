import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApiV2WithApiError } from "./fetchApiV2.ts";

export type MaintenanceTaskType = "LocationMigration" | "CoordinateMigration";
export type MaintenanceTaskStatus = "Idle" | "Running" | "Completed" | "Failed";

export interface MaintenanceTaskLogEntry {
  taskType: MaintenanceTaskType;
  status: MaintenanceTaskStatus;
  affectedCount: number | null;
  message: string | null;
  parameters: string | null;
  isDryRun: boolean;
  onlyMissing: boolean;
  startedByName: string | null;
  startedAt: string;
  completedAt: string;
}

export interface PaginatedLogResponse {
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  logEntries: MaintenanceTaskLogEntry[];
}

export interface MaintenanceTaskState {
  type: MaintenanceTaskType;
  status: MaintenanceTaskStatus;
  affectedCount: number | null;
  message: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface MigrationParams {
  onlyMissing: boolean;
  dryRun: boolean;
}

const maintenanceStatusQueryKey = "maintenanceStatus";
const maintenanceLogsQueryKey = "maintenanceLogs";

export const useMaintenanceStatus = () =>
  useQuery({
    queryKey: [maintenanceStatusQueryKey],
    queryFn: () => fetchApiV2WithApiError<MaintenanceTaskState[]>("maintenance/status", "GET"),
    refetchInterval: query => {
      const maintenanceTaskStates = query.state.data;
      return maintenanceTaskStates?.some(s => s.status === "Running") ? 5000 : false;
    },
  });

export const useMaintenanceLogs = (pageNumber: number, includeDryRun: boolean) =>
  useQuery({
    queryKey: [maintenanceLogsQueryKey, pageNumber, includeDryRun],
    queryFn: () =>
      fetchApiV2WithApiError<PaginatedLogResponse>(
        `maintenance/logs?pageNumber=${pageNumber}&includeDryRun=${includeDryRun}`,
        "GET",
      ),
    placeholderData: keepPreviousData,
  });

export const useStartMigration = (taskType: MaintenanceTaskType) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (params: MigrationParams) => fetchApiV2WithApiError<void>(`maintenance/${taskType}`, "POST", params),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [maintenanceStatusQueryKey] });
      queryClient.invalidateQueries({ queryKey: [maintenanceLogsQueryKey] });
    },
  });
};
