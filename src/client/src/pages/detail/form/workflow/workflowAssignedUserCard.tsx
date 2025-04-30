import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Button, Stack, Typography } from "@mui/material";
import AssignUser from "../../../../assets/icons/assignUser.svg?react";
import { capitalizeFirstLetter } from "../../../../utils.ts";
import { WorkflowCard } from "./styledWorkflowComponents.tsx";
import { useWorkflow } from "./workflow.ts";

export const WorkflowAssignedUserCard = () => {
  const { t } = useTranslation();
  const { id: boreholeId } = useParams<{ id: string }>();
  const { data: workflow } = useWorkflow(parseInt(boreholeId));

  return (
    <WorkflowCard>
      <Stack gap={1.5} data-cy={"workflow-assigned-user-card"}>
        <Typography variant="h5">{t("assignedPerson")}</Typography>
        <Typography variant="body1">{`${[capitalizeFirstLetter(workflow?.assignee?.firstName), capitalizeFirstLetter(workflow?.assignee?.lastName)].filter(Boolean).join(" ")}`}</Typography>
        <Button
          variant="outlined"
          data-cy={"assign-user-button"}
          endIcon={<AssignUser />}
          onClick={() => {
            console.log("Assign user");
          }}>
          {t("assignUser")}
        </Button>
      </Stack>
    </WorkflowCard>
  );
};
