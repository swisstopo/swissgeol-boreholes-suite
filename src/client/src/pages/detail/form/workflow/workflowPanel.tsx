import { useSelector } from "react-redux";
import { useLocation, useParams } from "react-router-dom";
import { ReduxRootState, User } from "../../../../api-lib/ReduxStateInterfaces.ts";
import LegacyWorkflowForm from "./legacyWorkflowForm";
import { WorkflowForm } from "./workflowForm.tsx";

export const WorkflowPanel = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();
  const currentUser: User = useSelector((state: ReduxRootState) => state.core_user);

  return (
    <>
      {currentUser.data.admin && location.search === "?dev=true" ? (
        <WorkflowForm />
      ) : (
        <LegacyWorkflowForm id={parseInt(id!, 10)} />
      )}
    </>
  );
};
