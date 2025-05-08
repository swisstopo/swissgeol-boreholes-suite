import { useTranslation } from "react-i18next";
import { Button, Stack, Typography } from "@mui/material";
import AssignUser from "../../../../assets/icons/assignUser.svg?react";
import { useRequiredParams } from "../../../../hooks/useRequiredParams.ts";
import { capitalizeFirstLetter } from "../../../../utils.ts";
import { WorkflowCard } from "./styledWorkflowComponents.tsx";
import { useWorkflow } from "./workflow.ts";

export const WorkflowAssignedUserCard = () => {
  const { t } = useTranslation();
  const { id: boreholeId } = useRequiredParams<{ id: string }>();
  const { data: workflow } = useWorkflow(parseInt(boreholeId));

  return (
    <WorkflowCard>
      <Stack gap={1.5} data-cy={"workflow-assigned-user-card"}>
        <Typography variant="h5">{t("assignedPerson")}</Typography>
        <Typography data-cy={"assigned-user-name"}>
          {[capitalizeFirstLetter(workflow?.assignee?.firstName), capitalizeFirstLetter(workflow?.assignee?.lastName)]
            .filter(Boolean)
            .join(" ")}
        </Typography>
        <Button
          variant="outlined"
          data-cy={"assign-user-button"}
          endIcon={<AssignUser />}
          onClick={() => {
            //Todo: implement assign user functionality
          }}>
          {t("assignUser")}
        </Button>
      </Stack>
    </WorkflowCard>
  );
};
