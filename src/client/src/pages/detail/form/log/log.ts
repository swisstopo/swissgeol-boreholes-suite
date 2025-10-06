import { useQuery } from "@tanstack/react-query";

export interface LogRun {
  id: number;
  boreholeId: number;
}

export const logsByBoreholeIdQueryKey = "logsByBoreholeId";
export const useLogsByBoreholeId = (boreholeId?: number) =>
  useQuery({
    queryKey: [logsByBoreholeIdQueryKey, boreholeId],
    queryFn: async () => {
      return [];
    },
    enabled: !!boreholeId,
  });
