import { Navigate } from "react-router";
import { CircularProgress } from "@mui/material";
import { Borehole } from "../../../../api/generated";
import { FullPageCentered } from "../../../../components/styledComponents.ts";
import { useCanViewWorkflow } from "./useCanViewWorkflow.ts";
import { WorkflowView } from "./workflowView.tsx";

interface WorkflowRouteProps {
  borehole: Borehole;
}

// The status page is reachable by URL, so it applies the same visibility rule as its menu item.
export const WorkflowRoute = ({ borehole }: WorkflowRouteProps) => {
  const { isLoading, canView } = useCanViewWorkflow(borehole.workgroup?.id ?? 0);

  if (isLoading)
    return (
      <FullPageCentered>
        <CircularProgress />
      </FullPageCentered>
    );

  if (!canView) return <Navigate to={`/${borehole.id}/location`} replace />;

  return <WorkflowView key={borehole.id} />;
};
