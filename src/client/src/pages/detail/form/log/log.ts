import { useMutation, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { User } from "../../../../api/apiInterfaces.ts";
import { fetchApiV2WithApiError } from "../../../../api/fetchApiV2.ts";
import { useResetTabStatus } from "../../../../hooks/useResetTabStatus.ts";

export interface LogRun {
  id: number;
  boreholeId: number;
  runNumber?: string;
  fromDepth?: number;
  toDepth?: number;
  runDate?: Date;
  comment?: string;
  serviceCo?: string;
  bitSize?: number;
  conveyanceMethodId: number;
  boreholeStatusId?: number;
  logFiles: LogFile[];
  createdBy?: User | null;
  updatedBy?: User | null;
}

export interface LogFile {
  id: number;
  logRunId: number;
  name: string;
  public: boolean;
  toolTypeCodelistIds: number[];
}

export const logsQueryKey = "logs";
export const useLogsByBoreholeId = (boreholeId?: number): UseQueryResult<LogRun[]> =>
  useQuery<LogRun[]>({
    queryKey: [logsQueryKey, boreholeId],
    queryFn: async (): Promise<LogRun[]> => {
      return await fetchApiV2WithApiError<LogRun[]>(`logrun?boreholeId=${boreholeId}`, "GET");
    },
    enabled: !!boreholeId,
  });

const logRunController = "logrun";

export const useLogRunMutations = () => {
  const queryClient = useQueryClient();
  const resetTabStatus = useResetTabStatus(["log"]);

  const useAddLogRun = useMutation({
    mutationFn: async (logRun: LogRun) => {
      return await fetchApiV2WithApiError(logRunController, "POST", logRun);
    },
    onSuccess: (_data, logRun) => {
      resetTabStatus();
      queryClient.invalidateQueries({ queryKey: [logsQueryKey, logRun.boreholeId] });
    },
  });

  const useUpdateLogRun = useMutation({
    mutationFn: async (logRun: LogRun) => {
      // remove derived objects
      delete logRun.createdBy;
      delete logRun.updatedBy;

      return await fetchApiV2WithApiError(logRunController, "PUT", logRun);
    },
    onSuccess: (_data, logRun) => {
      resetTabStatus();
      queryClient.invalidateQueries({ queryKey: [logsQueryKey, logRun.boreholeId] });
    },
  });

  const useDeleteLogRuns = useMutation({
    mutationFn: async (logRuns: LogRun[]) => {
      return await fetchApiV2WithApiError(
        `logrun?${logRuns.map(logrun => `logRunIds=${logrun.id}`).join("&")}`,
        "DELETE",
      );
    },
    onSuccess: (_data, logRuns) => {
      resetTabStatus();
      queryClient.invalidateQueries({ queryKey: [logsQueryKey, logRuns[0]?.boreholeId] });
    },
  });

  return {
    add: useAddLogRun,
    update: useUpdateLogRun,
    delete: useDeleteLogRuns,
  };
};
