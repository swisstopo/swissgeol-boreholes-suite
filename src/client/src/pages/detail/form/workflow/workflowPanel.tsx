import { useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import { ReduxRootState, User } from "../../../../api-lib/ReduxStateInterfaces.ts";
import LegacyWorkflowForm from "./legacyWorkflowForm";
import { WorkflowView } from "./workflowView.tsx";

export const WorkflowPanel = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const currentUser: User = useSelector((state: ReduxRootState) => state.core_user);
  const hasDevFlag = location.search.includes("?dev=true") || location.hash.includes("?dev=true");
  return <>{currentUser.data.admin && hasDevFlag ? <WorkflowView /> : <LegacyWorkflowForm id={parseInt(id, 10)} />}</>;
};
