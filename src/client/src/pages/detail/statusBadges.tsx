import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Chip, Stack } from "@mui/material";
import { WorkflowStatus } from "@swissgeol/ui-core";
import { BoreholeV2 } from "../../api/borehole.ts";
import { useCurrentUser } from "../../api/user.ts";
import { theme } from "../../AppTheme.ts";
import { EditButton } from "../../components/buttons/buttons.tsx";
import { restrictionCode, restrictionFreeCode, restrictionUntilCode } from "../../components/codelist.ts";
import { colorStatusMap } from "./form/workflow/statusColorMap.ts";
import { useWorkflowMutation, WorkflowChangeRequest } from "./form/workflow/workflow.ts";

interface StatusBadgesProps {
  borehole?: BoreholeV2 | null;
}

export const StatusBadges = ({ borehole }: StatusBadgesProps) => {
  const { t } = useTranslation();
  const { data: currentUser } = useCurrentUser();
  const {
    updateWorkflow: { mutate: updateWorkflow },
  } = useWorkflowMutation();
  const workflow = useMemo(() => borehole?.workflow, [borehole]);

  if (!borehole || !workflow?.status) return null;

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

  const AssigneeChip = (
    <Chip
      data-cy="workflow-assignee-chip"
      color="secondary"
      label={`${workflow?.assignee?.firstName} ${workflow?.assignee?.lastName}`}
      sx={{ backgroundColor: theme.palette.border.light, color: "black" }}
    />
  );

  const getRestrictionLabel = () => {
    let restrictionLabel;
    switch (borehole?.restrictionId) {
      case restrictionFreeCode:
        restrictionLabel = t("free");
        break;
      case restrictionCode:
        restrictionLabel = t("restricted");
        break;
      case restrictionUntilCode:
        restrictionLabel = `${t("restriction_until")} ${borehole?.restrictionUntil}`;
        break;
      default:
        return;
    }
    return restrictionLabel;
  };

  const restrictionLabel = getRestrictionLabel();
  const RestrictionChip = (
    <Chip
      data-cy="restricted-chip"
      color="secondary"
      label={restrictionLabel}
      sx={{ backgroundColor: theme.palette.border.light, color: "black" }}
    />
  );

  const ChangesRequestedChip = (
    <Chip data-cy="workflow-changes-requested-chip" label={t("changesRequested")} color={"error"} />
  );

  // Chip additionally displays reviewed status if workflow is published
  const ReviewedChip = (
    <Chip data-cy="workflow-additional-reviewed-chip" label={t("statuses.Reviewed")} color="success" />
  );

  const isDraft = workflow.status === WorkflowStatus.Draft;
  const isPublished = workflow.status === WorkflowStatus.Published;
  const hasAssignee = !!workflow.assignee?.id;
  const isCurrentUserAssignee = workflow.assignee?.id === currentUser?.id;
  const showReviewButton = isDraft && isCurrentUserAssignee;
  const showRestrictionChip = !isPublished && !!restrictionLabel;

  return (
    <Stack
      direction="row"
      gap={1}
      alignItems="center"
      sx={{ p: 1, borderRadius: 1, border: showReviewButton ? `1px solid ${theme.palette.border.light}` : "none" }}>
      {isPublished && ReviewedChip}
      {StatusChip}
      {!isPublished && hasAssignee && AssigneeChip}
      {workflow.hasRequestedChanges && ChangesRequestedChip}
      {showRestrictionChip && RestrictionChip}
      {showReviewButton && <EditButton label={"review"} variant={"outlined"} onClick={startReview} />}
    </Stack>
  );
};
