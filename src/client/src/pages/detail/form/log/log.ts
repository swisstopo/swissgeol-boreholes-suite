import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { fetchApiV2WithApiError } from "../../../../api/fetchApiV2.ts";

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
      const response = await fetchApiV2WithApiError<LogRun[]>(`logrun?boreholeId=${boreholeId}`, "GET");
      return response as LogRun[];
    },
    enabled: !!boreholeId,
  });
