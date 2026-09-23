import {
  GenericWorkflow,
  GenericWorkflowSelection,
  LocalDate,
  WorkflowChange as SwissgeolWorkflowChange,
  WorkflowStatus,
} from "@swissgeol/ui-core";
import { useMutation, useQuery, useQueryClient, UseQueryResult } from "@tanstack/react-query";
import { boreholeQueryKey, canEditQueryKey, canManageQueryKey } from "../../../../api/borehole.ts";
import { fetchApiV2Legacy } from "../../../../api/fetchApiV2.ts";
import { WorkflowStatus as GeneratedWorkflowStatus } from "../../../../api/generated";
import { NullableDateString } from "../../../../api/unionTypes.ts";

export interface Workflow extends GenericWorkflow {
  id: number;
  boreholeId: number;
  reviewedTabs: Omit<TabStatus, "id">;
  publishedTabs: Omit<TabStatus, "id">;
}

export interface WorkflowChange extends Omit<SwissgeolWorkflowChange, "createdAt"> {
  created?: NullableDateString;
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
  log: boolean;
  identifiers: boolean;
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

// The generated client types the status as a string union, ui-core as a string enum with the same
// members, and `no-unsafe-enum-comparison` rejects comparing one with the other. The map is checked
// against both types, so a status the API adds or drops fails the build here.
const workflowStatusByGeneratedStatus = {
  Draft: WorkflowStatus.Draft,
  InReview: WorkflowStatus.InReview,
  Reviewed: WorkflowStatus.Reviewed,
  Published: WorkflowStatus.Published,
} as const satisfies Record<GeneratedWorkflowStatus, WorkflowStatus>;

export const toWorkflowStatus = (status: GeneratedWorkflowStatus | undefined): WorkflowStatus | undefined =>
  status ? workflowStatusByGeneratedStatus[status] : undefined;

const fetchWorkflowByBoreholeId = async (boreholeId: number): Promise<Workflow> =>
  await fetchApiV2Legacy(`workflow/${boreholeId}`, "GET");

const sendWorkflowChangeRequest = async (workflowChangeRequest: WorkflowChangeRequest) => {
  await fetchApiV2Legacy(`workflow/change`, "POST", workflowChangeRequest);
};

const sendTabStatusChangeRequest = async (tabStatusChangeRequest: TabStatusChangeRequest) => {
  await fetchApiV2Legacy(`workflow/tabstatuschange`, "POST", tabStatusChangeRequest);
};

const workflowQueryKey = "workflows";

export const useWorkflow = (boreholeId: number): UseQueryResult<Workflow> => {
  return useQuery({
    queryKey: [workflowQueryKey, boreholeId],
    queryFn: () => {
      return fetchWorkflowByBoreholeId(boreholeId);
    },
    enabled: !!boreholeId,
  });
};

export const useWorkflowMutation = () => {
  const queryClient = useQueryClient();

  // Not awaited: the caller should proceed as soon as the write succeeded, not when the refetches
  // these invalidations trigger have settled.
  function invalidateBoreholeAndWorkflowQueries(boreholeId: number) {
    void queryClient.invalidateQueries({ queryKey: [workflowQueryKey, Number(boreholeId)] });
    void queryClient.invalidateQueries({ queryKey: [boreholeQueryKey, Number(boreholeId)] });
    void queryClient.invalidateQueries({ queryKey: [canEditQueryKey] });
    void queryClient.invalidateQueries({ queryKey: [canManageQueryKey] });
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

  return {
    updateWorkflow,
    updateTabStatus,
  };
};
