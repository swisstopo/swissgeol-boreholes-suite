import { useMutation, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { NullableDateString, User } from "../../../../api/apiInterfaces.ts";
import { fetchApiV2WithApiError } from "../../../../api/fetchApiV2.ts";
import { Codelist } from "../../../../components/codelist.ts";
import { useResetTabStatus } from "../../../../hooks/useResetTabStatus.ts";

export interface TmpLogRun extends LogRun {
  tmpId: string;
}

export interface LogRunChangeTracker {
  item: TmpLogRun;
  hasChanges: boolean;
}

export interface LogRun {
  id: number;
  boreholeId: number;
  runNumber: string;
  fromDepth: number;
  toDepth: number;
  runDate?: NullableDateString;
  comment?: string;
  serviceCo?: string;
  bitSize?: number;
  conveyanceMethodId?: number | null;
  conveyanceMethod?: Codelist;
  boreholeStatusId?: number | null;
  boreholeStatus?: Codelist;
  logFiles?: LogFile[];
  created?: NullableDateString;
  createdBy?: User | null;
  updated?: NullableDateString;
  updatedBy?: User | null;
}

export interface LogFile {
  id: number;
  logRunId: number;
  name: string;
  fileType: string;
  passTypeId?: number;
  passType?: Codelist;
  pass?: number;
  dataPackageId?: number;
  dataPackage?: Codelist;
  deliveryDate?: NullableDateString;
  depthTypeId?: number;
  depthType?: Codelist;
  toolTypeCodelistIds: number[];
  toolTypeCodelists?: Codelist[];
  public: boolean;
  created?: NullableDateString;
  createdBy?: User | null;
  updated?: NullableDateString;
  updatedBy?: User | null;
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
