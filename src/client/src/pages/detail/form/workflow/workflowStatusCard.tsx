import { useTranslation } from "react-i18next";
import { Typography } from "@mui/material";
import { WorkflowCard } from "./styledWorkflowComponents.tsx";

export const WorkflowStatusCard = () => {
  const { t } = useTranslation();
  return (
    <WorkflowCard>
      <Typography variant="h5">{t("status")}</Typography>
    </WorkflowCard>
  );
};
