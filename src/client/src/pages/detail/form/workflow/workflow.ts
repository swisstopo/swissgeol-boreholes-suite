import { useQuery, UseQueryResult } from "@tanstack/react-query";
import { User } from "../../../../api/apiInterfaces.ts";
import { fetchApiV2 } from "../../../../api/fetchApiV2.ts";
import { useShowAlertOnError } from "../../../../hooks/useShowAlertOnError.ts";

export enum WorkflowStatus {
  Draft = "Draft",
  InReview = "InReview",
  Reviewed = "Reviewed",
  Published = "Published",
}

export interface WorkflowV2 {
  id: number;
  hasRequestedChanges: boolean;
  status: WorkflowStatus;
  boreholeId: number;
  reviewedTabs: TabStatus;
  publishedTabs: TabStatus;
  assigneeId: number | null;
  assignee: User | null;
  changes: WorkflowChange[];
}

export interface WorkflowChange {
  id: number;
  comment: string;
  fromStatus: WorkflowStatus;
  toStatus: WorkflowStatus;
  createdById: number | null;
  createdBy: User | null;
  created: string;
  assigneeId: number | null;
  assignee: User | null;
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

export const fetchWorkflowByBoreholeId = async (boreholeId: number) =>
  await fetchApiV2(`workflow/${boreholeId}`, "GET");

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
