import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import { WorkflowCard } from "./styledWorkflowComponents.tsx";

export const WorkflowAssignedUserCard = () => {
  const { t } = useTranslation();

  return (
    <WorkflowCard>
      <Typography variant="h5">{t("assignedPerson")}</Typography>
    </WorkflowCard>
  );
};
