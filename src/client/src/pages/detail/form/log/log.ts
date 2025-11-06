import { useMutation, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { NullableDateString, User } from "../../../../api/apiInterfaces.ts";
import { boreholeQueryKey } from "../../../../api/borehole.ts";
import { fetchApiV2WithApiError, uploadWithApiError } from "../../../../api/fetchApiV2.ts";
import { Codelist } from "../../../../components/codelist.ts";
import { useResetTabStatus } from "../../../../hooks/useResetTabStatus.ts";

export interface LogRunChangeTracker {
  item: LogRun;
  hasChanges: boolean;
}

export interface LogRun {
  id: number;
  tmpId?: string;
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
  tmpId?: string;
  logRunId: number;
  name?: string;
  extension?: string;
  file?: File;
  passTypeId?: number | null;
  passType?: Codelist;
  pass?: number | null;
  dataPackageId?: number | null;
  dataPackage?: Codelist;
  deliveryDate?: NullableDateString;
  depthTypeId?: number | null;
  depthType?: Codelist;
  toolTypeCodelistIds: number[];
  toolTypeCodelists?: Codelist[];
  public: boolean;
  created?: NullableDateString;
  createdBy?: User | null;
  updated?: NullableDateString;
  updatedBy?: User | null;
}

const logController = "log";
export const logsQueryKey = "logs";
export const useLogsByBoreholeId = (boreholeId?: number): UseQueryResult<LogRun[]> =>
  useQuery<LogRun[]>({
    queryKey: [logsQueryKey, boreholeId],
    queryFn: async (): Promise<LogRun[]> => {
      return await fetchApiV2WithApiError<LogRun[]>(`${logController}?boreholeId=${boreholeId}`, "GET");
    },
    enabled: !!boreholeId,
  });

export const useLogRunMutations = () => {
  const queryClient = useQueryClient();
  const resetTabStatus = useResetTabStatus(["log"]);

  const useAddLogRun = useMutation({
    mutationFn: async (logRun: LogRun) => {
      return await fetchApiV2WithApiError<LogRun>(logController, "POST", logRun);
    },
    onSuccess: (_data, logRun) => {
      resetTabStatus();
      queryClient.invalidateQueries({ queryKey: [logsQueryKey, logRun.boreholeId] });
      queryClient.invalidateQueries({ queryKey: [boreholeQueryKey, logRun.boreholeId] });
    },
  });

  const useUpdateLogRun = useMutation({
    mutationFn: async (logRun: LogRun) => {
      if (logRun.logFiles?.some(file => file.file)) {
        const uploadPromises = logRun.logFiles.map(async file => {
          file.logRunId = logRun.id;
          if (file.file) {
            const formData = new FormData();
            formData.append("file", file.file);
            const savedFile = await uploadWithApiError<LogFile>(
              `${logController}/upload?logRunId=${logRun.id}`,
              "POST",
              formData,
            );
            file.id = savedFile.id;
            delete file.file;
          }
          return file;
        });
        logRun.logFiles = await Promise.all(uploadPromises);
      }
      return await fetchApiV2WithApiError<LogRun>(logController, "PUT", logRun);
    },
    onSuccess: (_data, logRun) => {
      resetTabStatus();
      queryClient.invalidateQueries({ queryKey: [logsQueryKey, logRun.boreholeId] });
    },
  });

  const useDeleteLogRuns = useMutation({
    mutationFn: async (logRuns: LogRun[]) => {
      const queryParams = logRuns.map(logRun => "logRunIds=" + logRun.id).join("&");
      return await fetchApiV2WithApiError(`${logController}?${queryParams}`, "DELETE");
    },
    onSuccess: (_data, logRuns) => {
      resetTabStatus();
      queryClient.invalidateQueries({ queryKey: [logsQueryKey, logRuns[0]?.boreholeId] });
      queryClient.invalidateQueries({ queryKey: [boreholeQueryKey, logRuns[0]?.boreholeId] });
    },
  });

  return {
    add: useAddLogRun,
    update: useUpdateLogRun,
    delete: useDeleteLogRuns,
  };
};
