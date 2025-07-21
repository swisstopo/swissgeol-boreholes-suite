import { ChipOwnProps } from "@mui/material";
import { WorkflowStatus } from "@swissgeol/ui-core";

export const colorStatusMap: Record<WorkflowStatus, ChipOwnProps["color"]> = {
  [WorkflowStatus.Draft]: "info",
  [WorkflowStatus.InReview]: "warning",
  [WorkflowStatus.Reviewed]: "success",
  [WorkflowStatus.Published]: "success",
};
