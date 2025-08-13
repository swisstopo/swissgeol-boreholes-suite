import { useTranslation } from "react-i18next";
import { Chip, Stack } from "@mui/material";
import { WorkflowStatus } from "@swissgeol/ui-core";
import { useCurrentUser } from "../../api/user.ts";
import { theme } from "../../AppTheme.ts";
import { EditButton } from "../../components/buttons/buttons.tsx";
import { colorStatusMap } from "./form/workflow/statusColorMap.ts";
import { useWorkflowMutation, Workflow, WorkflowChangeRequest } from "./form/workflow/workflow.ts";

interface StatusBadgesProps {
  workflow?: Workflow | null;
}

export const StatusBadges = ({ workflow }: StatusBadgesProps) => {
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();
  const {
    updateWorkflow: { mutate: updateWorkflow },
  } = useWorkflowMutation();

  if (!workflow?.status) return null;

  const startReview = () => {
    const workflowChangeRequest: WorkflowChangeRequest = {
      boreholeId: workflow.boreholeId,
      newAssigneeId: currentUser?.id,
      newStatus: WorkflowStatus.InReview,
    };
    updateWorkflow(workflowChangeRequest);
  };

  const StatusChip = (
    <Chip
      data-cy="workflow-status-chip"
      label={t(`statuses.${workflow.status}`)}
      color={colorStatusMap[workflow.status]}
    />
  );

  const assigneeLabel = workflow.assignee ? `${workflow.assignee.firstName} ${workflow.assignee.lastName}` : t("free");
  const AssigneeChip = (
    <Chip
      data-cy="workflow-assignee-chip"
      color="secondary"
      label={assigneeLabel}
      sx={{ backgroundColor: theme.palette.border.light, color: "black" }}
    />
  );

  const ChangesRequestedChip = (
    <Chip data-cy="workflow-changes-requested-chip" label={t("changesRequested")} color={"error"} />
  );

  // Chip additionally displays reviewed status if workflow is published
  const ReviewdChip = (
    <Chip data-cy="workflow-additional-reviewed-chip" label={t("statuses.Reviewed")} color="success" />
  );

  const isDraft = workflow.status === WorkflowStatus.Draft;
  const isPublished = workflow.status === WorkflowStatus.Published;
  const isCurrentUserAssignee = workflow.assignee?.id === currentUser?.id;
  const showReviewButton = isDraft && isCurrentUserAssignee;

  return (
    <Stack
      direction="row"
      gap={1}
      alignItems="center"
      sx={{ p: 1, borderRadius: 1, border: showReviewButton ? `1px solid ${theme.palette.border.light}` : "none" }}>
      {isPublished && ReviewdChip}
      {StatusChip}
      {!isPublished && AssigneeChip}
      {workflow.hasRequestedChanges && ChangesRequestedChip}
      {showReviewButton && <EditButton label={"review"} variant={"outlined"} onClick={startReview} />}
    </Stack>
  );
};
