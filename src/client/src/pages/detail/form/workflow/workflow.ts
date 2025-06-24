import {
  GenericWorkflow,
  WorkflowChange as SwissgeolWorkflowChange,
  WorkflowStatus,
} from "@swisstopo/swissgeol-ui-core";
import { useMutation, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { boreholeQueryKey } from "../../../../api/borehole.ts";
import { fetchApiV2 } from "../../../../api/fetchApiV2.ts";
import { useShowAlertOnError } from "../../../../hooks/useShowAlertOnError.ts";

export { WorkflowStatus };

export interface WorkflowV2 extends GenericWorkflow {
  id: number;
  reviewedTabs: TabStatus;
  publishedTabs: TabStatus;
}

export interface WorkflowChange extends SwissgeolWorkflowChange {
  id: number;
}

export interface TabStatus {
  id: number;
  general: boolean;
  section: boolean;
  geometry: boolean;
  lithology: boolean;
  chronostratigraphy: boolean;
  lithostratigraphy: boolean;
  casing: boolean;
  instrumentation: boolean;
  backfill: boolean;
  waterIngress: boolean;
  groundwater: boolean;
  fieldMeasurement: boolean;
  hydrotest: boolean;
  profile: boolean;
  photo: boolean;
}

export interface WorkflowChangeRequest {
  boreholeId: string;
  comment: string | null;
  newAssigneeId: number | undefined;
  newStatus: WorkflowStatus;
}

export const fetchWorkflowByBoreholeId = async (boreholeId: number) =>
  await fetchApiV2(`workflow/${boreholeId}`, "GET");

export const sendWorkflowChangeRequest = async (workflowChangeRequest: WorkflowChangeRequest) => {
  await fetchApiV2(`workflow/change`, "POST", workflowChangeRequest);
};

export const workflowQueryKey = "workflows";

export const useWorkflow = (boreholeId: number): UseQueryResult<WorkflowV2> => {
  const query = useQuery({
    queryKey: [workflowQueryKey, boreholeId],
    queryFn: () => {
      return fetchWorkflowByBoreholeId(boreholeId);
    },
    enabled: !!boreholeId,
  });

  useShowAlertOnError(query.isError, query.error);
  return query;
};

export const useWorkflowMutation = () => {
  const queryClient = useQueryClient();

  const updateWorkflow = useMutation({
    mutationFn: (request: WorkflowChangeRequest) => sendWorkflowChangeRequest(request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: [workflowQueryKey, Number(variables.boreholeId)],
      });
      queryClient.invalidateQueries({
        queryKey: [boreholeQueryKey, Number(variables.boreholeId)],
      });
    },
  });

  useShowAlertOnError(updateWorkflow.isError, updateWorkflow.error);

  return {
    update: updateWorkflow,
  };
};
