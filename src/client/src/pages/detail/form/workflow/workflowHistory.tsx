import { Stack } from "@mui/material";
import { useRequiredParams } from "../../../../hooks/useRequiredParams.ts";
import { HistoryEntry } from "./historyEntry.tsx";
import { useWorkflow, WorkflowChange } from "./workflow.ts";

export const WorkflowHistory = () => {
  const { id: boreholeId } = useRequiredParams<{ id: string }>();
  const { data: workflow } = useWorkflow(parseInt(boreholeId));

  return (
    <Stack spacing={3} p={3}>
      {workflow?.changes
        .sort((a: WorkflowChange, b: WorkflowChange) => {
          return b.created.localeCompare(a.created);
        })
        .map((wc: WorkflowChange) => <HistoryEntry key={wc.id} workflowChange={wc} />)}
    </Stack>
  );
};
