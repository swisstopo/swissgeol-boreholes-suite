import {
  GenericWorkflow,
  GenericWorkflowSelection,
  LocalDate,
  WorkflowChange as SwissgeolWorkflowChange,
  WorkflowStatus,
} from "@swissgeol/ui-core";
import { useMutation, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { boreholeQueryKey } from "../../../../api/borehole.ts";
import { fetchApiV2 } from "../../../../api/fetchApiV2.ts";
import { useShowAlertOnError } from "../../../../hooks/useShowAlertOnError.ts";

export { WorkflowStatus };

export interface Workflow extends GenericWorkflow {
  id: number;
  boreholeId: number;
  reviewedTabs: TabStatus;
  publishedTabs: TabStatus;
}

export interface WorkflowChange extends Omit<SwissgeolWorkflowChange, "createdAt"> {
  created?: Date | string | null;
  createdAt: LocalDate | string;
}

export type TabName = Exclude<keyof TabStatus, "id">;

export interface TabStatus {
  id: number;
  general: boolean;
  location: boolean;
  sections: boolean;
  geometry: boolean;
  lithology: boolean;
  chronostratigraphy: boolean;
  lithostratigraphy: boolean;
  casing: boolean;
  instrumentation: boolean;
  backfill: boolean;
  waterIngress: boolean;
  groundwaterLevelMeasurement: boolean;
  fieldMeasurement: boolean;
  hydrotest: boolean;
  profiles: boolean;
  photos: boolean;
  documents: boolean;
}

export interface WorkflowChangeRequest {
  boreholeId: number;
  newStatus: WorkflowStatus;
  comment?: string | null;
  newAssigneeId?: number;
  hasRequestedChanges?: boolean;
}

export interface TabStatusChangeRequest {
  boreholeId: number;
  tab: TabType;
  changes: Partial<GenericWorkflowSelection>;
}

export enum TabType {
  Unknown,
  Reviewed,
  Published,
}

export const fetchWorkflowByBoreholeId = async (boreholeId: number): Promise<Workflow> =>
  await fetchApiV2(`workflow/${boreholeId}`, "GET");

export const sendWorkflowChangeRequest = async (workflowChangeRequest: WorkflowChangeRequest) => {
  await fetchApiV2(`workflow/change`, "POST", workflowChangeRequest);
};

export const sendTabStatusChangeRequest = async (tabStatusChangeRequest: TabStatusChangeRequest) => {
  await fetchApiV2(`workflow/tabstatuschange`, "POST", tabStatusChangeRequest);
};

export const workflowQueryKey = "workflows";

export const useWorkflow = (boreholeId: number): UseQueryResult<Workflow> => {
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

  function invalidateBoreholeAndWorkflowQueries(boreholeId: number) {
    queryClient.invalidateQueries({ queryKey: [workflowQueryKey, Number(boreholeId)] });
    queryClient.invalidateQueries({ queryKey: [boreholeQueryKey, Number(boreholeId)] });
  }

  const updateWorkflow = useMutation({
    mutationFn: (request: WorkflowChangeRequest) => sendWorkflowChangeRequest(request),
    onSuccess: (_, variables) => {
      invalidateBoreholeAndWorkflowQueries(variables.boreholeId);
    },
  });

  const updateTabStatus = useMutation({
    mutationFn: (request: TabStatusChangeRequest) => sendTabStatusChangeRequest(request),
    onSuccess: (_, variables) => {
      invalidateBoreholeAndWorkflowQueries(variables.boreholeId);
    },
  });

  useShowAlertOnError(updateWorkflow.isError, updateWorkflow.error);
  useShowAlertOnError(updateTabStatus.isError, updateTabStatus.error);

  return {
    updateWorkflow,
    updateTabStatus,
  };
};
