import { Box, Stack } from "@mui/material";
import { WorkflowAssignedUserCard } from "./workflowAssignedUserCard.tsx";
import { WorkflowStatusCard } from "./workflowStatusCard.tsx";
import { WorkflowTabs } from "./workflowTabs.tsx";

export const WorkflowView = () => {
  return (
    <Stack gap={1.5} direction="row">
        <Stack gap={1.5} sx={{ flexShrink: 0 }}>
          <WorkflowStatusCard />
          <WorkflowAssignedUserCard />
        </Stack>
        <Box sx={{ flexGrow: 0 }} width={"100%"}>
          <WorkflowTabs />
        </Box>
      </Box>
    </Stack>
  );
};
