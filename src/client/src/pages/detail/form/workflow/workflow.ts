import { useQuery } from "@tanstack/react-query";
import { fetchApiV2 } from "../../../../api/fetchApiV2.ts";
import { useShowAlertOnError } from "../../../../hooks/useShowAlertOnError.ts";

export const fetchWorkflowByBoreholeId = async (boreholeId: number) =>
  await fetchApiV2(`workflow/${boreholeId}`, "GET");

export const workflowQueryKey = "workflows";

export const useWorkflow = (boreholeId: number) => {
  const query = useQuery({
    queryKey: [workflowQueryKey, boreholeId],
    queryFn: async () => {
      return await fetchWorkflowByBoreholeId(boreholeId);
    },
    enabled: !!boreholeId,
  });

  useShowAlertOnError(query.isError, query.error);
  return query;
};
