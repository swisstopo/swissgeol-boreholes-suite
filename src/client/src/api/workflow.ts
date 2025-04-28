import { User } from "./apiInterfaces.ts";

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
