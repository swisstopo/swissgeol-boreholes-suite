import { useMutation, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { ApiError, NullableDateString, User } from "../../../../api/apiInterfaces.ts";
import { fetchApiV2WithApiError, upload } from "../../../../api/fetchApiV2.ts";
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
  deliveryDate?: NullableDateString | null;
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
      return await fetchApiV2WithApiError<LogRun>(logRunController, "POST", logRun);
    },
    onSuccess: (_data, logRun) => {
      resetTabStatus();
      queryClient.invalidateQueries({ queryKey: [logsQueryKey, logRun.boreholeId] });
    },
  });

  const useUpdateLogRun = useMutation({
    mutationFn: async (logRun: LogRun) => {
      return await fetchApiV2WithApiError<LogRun>(logRunController, "PUT", logRun);
    },
    onSuccess: (_data, logRun) => {
      resetTabStatus();
      queryClient.invalidateQueries({ queryKey: [logsQueryKey, logRun.boreholeId] });
    },
  });

  const useDeleteLogRuns = useMutation({
    mutationFn: async (logRuns: LogRun[]) => {
      return await fetchApiV2WithApiError(
        `${logRunController}?${logRuns.map(logrun => `logRunIds=${logrun.id}`).join("&")}`,
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

export const uploadLogFiles = async (logRunId: number, logFiles: LogFile[]): Promise<LogFile[]> => {
  // TODO: Check if we can optimize multiple file uploads in one request or use parallel uploads
  // TODO: Add error handling
  const uploadedLogFiles = [];
  for (const file of logFiles) {
    file.logRunId = logRunId;
    if (file.file) {
      const savedFile = await uploadLogFile(logRunId, file.file);
      file.id = savedFile.id;
      delete file.file;
    }
    uploadedLogFiles.push(file);
  }
  return uploadedLogFiles;
};

export const uploadLogFile = async (logRunId: number, file: File): Promise<LogFile> => {
  const formData = new FormData();
  formData.append("file", file);
  const response = await upload(`${logRunController}/upload?logRunId=${logRunId}`, "POST", formData);
  if (!response.ok) {
    throw new ApiError(await response.text(), response.status);
  } else {
    return (await response.json()) as LogFile;
  }
};
