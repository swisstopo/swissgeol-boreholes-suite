import { Stack } from "@mui/material";
import { WorkflowAssignedUserCard } from "./workflowAssignedUserCard.tsx";
import { WorkflowStatusCard } from "./workflowStatusCard.tsx";
import { WorkflowTabs } from "./workflowTabs.tsx";

export const WorkflowView = () => {
  return (
    <Stack gap={1.5} direction="row">
      <Stack gap={1.5}>
        <WorkflowStatusCard />
        <WorkflowAssignedUserCard />
      </Stack>
      <WorkflowTabs />
    </Stack>
  );
};
