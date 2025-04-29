import { useTranslation } from "react-i18next";
import { useParams } from "react-router-dom";
import { Typography } from "@mui/material";
import { WorkflowCard } from "./styledWorkflowComponents.tsx";
import { useWorkflow } from "./workflow.ts";

export const WorkflowHistory = () => {
  const { t } = useTranslation();
  const { id: boreholeId } = useParams<{ id: string }>();
  const { data: workflow } = useWorkflow(parseInt(boreholeId));

  console.log(workflow);

  return (
    <WorkflowCard>
      <Typography variant="h5">{t("status")}</Typography>
    </WorkflowCard>
  );
};
