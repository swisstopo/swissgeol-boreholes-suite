import { useTranslation } from "react-i18next";
import { Chip, ChipOwnProps, Stack } from "@mui/material";
import { WorkflowStatus } from "@swissgeol/ui-core";
import { theme } from "../../AppTheme.ts";
import { EditButton } from "../../components/buttons/buttons.tsx";
import { WorkflowV2 } from "./form/workflow/workflow.ts";

interface StatusBadgesProps {
  workflow?: WorkflowV2 | null;
}

export const StatusBadges = ({ workflow }: StatusBadgesProps) => {
  const { t } = useTranslation();

  console.log(workflow);
  if (!workflow?.status) return null;

  const colorStatusMap: Record<WorkflowStatus, ChipOwnProps["color"]> = {
    [WorkflowStatus.Draft]: "info",
    [WorkflowStatus.InReview]: "warning",
    [WorkflowStatus.Reviewed]: "success",
    [WorkflowStatus.Published]: "success",
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
    <Chip data-cy="workflow-changes-requested-chip" label={"changesRequested"} color={"error"} />
  );

  // Chip additionally displays reviewed status if workflow is published
  const ReviewdChip = (
    <Chip data-cy="workflow-additional-reviewed-chip" label={t("statuses.Reviewed")} color="success" />
  );

  const isDraft = workflow.status === WorkflowStatus.Draft;
  const isPublished = workflow.status === WorkflowStatus.Published;

  return (
    <Stack
      direction="row"
      gap={1}
      alignItems="center"
      sx={{ p: 1, borderRadius: 1, border: isDraft ? `1px solid ${theme.palette.border.light}` : "none" }}>
      {isPublished && ReviewdChip}
      {StatusChip}
      {!isPublished && AssigneeChip}
      {workflow.hasRequestedChanges && ChangesRequestedChip}
      {isDraft && (
        <EditButton
          label={"review"}
          variant={"outlined"}
          onClick={() => {
            console.log("review");
          }}
        />
      )}
    </Stack>
  );
};
