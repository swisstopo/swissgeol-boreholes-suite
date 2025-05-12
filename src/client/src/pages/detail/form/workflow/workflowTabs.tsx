import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Stack } from "@mui/material";
import { theme } from "../../../../AppTheme.ts";
import { Tab, TabPanel } from "../../../../components/tabs/tabPanel.tsx";
import { useRequiredParams } from "../../../../hooks/useRequiredParams.ts";
import { CheckboxTable } from "./checkboxTable.tsx";
import { useWorkflow } from "./workflow.ts";
import { WorkflowHistory } from "./workflowHistory.tsx";

export const WorkflowTabs = () => {
  const { t } = useTranslation();
  const { id: boreholeId } = useRequiredParams<{ id: string }>();
  const { data: workflow } = useWorkflow(parseInt(boreholeId));

  const tabs = useMemo<Tab[]>(
    () => [
      {
        label: t("history"),
        hash: "#history",
        component: <WorkflowHistory />,
      },
      {
        label: t("review"),
        hash: "#review",
        component: <CheckboxTable tabStatus={workflow?.reviewedTabs} checkAllTitle={"Reviewed"} />,
      },
      {
        label: t("publication"),
        hash: "#publication",
        component: <CheckboxTable tabStatus={workflow?.publishedTabs} checkAllTitle={"Published"} />,
      },
    ],
    [t, workflow?.publishedTabs, workflow?.reviewedTabs],
  );

  return (
    <Stack sx={{ position: "relative", minHeight: theme.spacing(20), width: "100%" }}>
      <TabPanel tabs={tabs} />
    </Stack>
  );
};
