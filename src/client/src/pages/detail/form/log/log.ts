import { useQuery, UseQueryResult } from "@tanstack/react-query";

export interface LogRun {
  id: number;
  boreholeId: number;
}

export const logsQueryKey = "logs";
export const useLogsByBoreholeId = (boreholeId?: number): UseQueryResult<LogRun[]> =>
  useQuery({
    queryKey: [logsQueryKey, boreholeId],
    queryFn: async () => {
      return [];
    },
    enabled: !!boreholeId,
  });
