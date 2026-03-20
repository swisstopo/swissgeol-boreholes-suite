import { useEffect, useRef } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchApiV2WithApiError } from "./fetchApiV2.ts";

export type MaintenanceTaskType = "LocationMigration" | "CoordinateMigration" | "UserMerge";
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

export interface MaintenanceTaskParams {
  onlyMissing: boolean;
  dryRun: boolean;
}

const maintenanceStatusQueryKey = "maintenanceStatus";
const maintenanceLogsQueryKey = "maintenanceLogs";

export const useMaintenanceStatus = () => {
  const queryClient = useQueryClient();
  const previouslyRunning = useRef(new Set<MaintenanceTaskType>());
  const query = useQuery({
    queryKey: [maintenanceStatusQueryKey],
    queryFn: () => fetchApiV2WithApiError<MaintenanceTaskState[]>("maintenance/status", "GET"),
    refetchInterval: q => (q.state.data?.some(s => s.status === "Running") ? 2000 : false),
  });

  useEffect(() => {
    if (!query.data) return;
    const currentlyRunning = new Set(query.data.filter(s => s.status === "Running").map(s => s.type));
    const anyTaskCompleted = [...previouslyRunning.current].some(type => !currentlyRunning.has(type));
    previouslyRunning.current = currentlyRunning;
    if (anyTaskCompleted) {
      queryClient.invalidateQueries({ queryKey: [maintenanceLogsQueryKey] });
    }
  }, [query.data, queryClient]);

  return query;
};

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
    mutationFn: (params: MaintenanceTaskParams) =>
      fetchApiV2WithApiError<void>(`maintenance/${taskType}`, "POST", params),
    onSuccess: () => {
      // Optimistically mark the task as running so the UI updates immediately
      // without waiting for the next status poll.
      queryClient.setQueryData<MaintenanceTaskState[]>([maintenanceStatusQueryKey], old =>
        old?.map(s => (s.type === taskType ? { ...s, status: "Running" as MaintenanceTaskStatus } : s)),
      );
    },
  });
};
