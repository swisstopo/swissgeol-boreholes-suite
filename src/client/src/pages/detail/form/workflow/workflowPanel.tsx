import { useSelector } from "react-redux";
import { ReduxRootState, User } from "../../../../api-lib/ReduxStateInterfaces.ts";
import { useBorehole } from "../../../../api/borehole.ts";
import { useDevMode } from "../../../../hooks/useDevMode.tsx";
import { useRequiredParams } from "../../../../hooks/useRequiredParams.ts";
import LegacyWorkflowForm from "./legacyWorkflow/legacyWorkflowForm";
import { WorkflowView } from "./workflowView.tsx";

export const WorkflowPanel = () => {
  const { id } = useRequiredParams<{ id: string }>();
  const { data: borehole } = useBorehole(parseInt(id, 10));
  const currentUser: User = useSelector((state: ReduxRootState) => state.core_user);
  const { runsDevMode } = useDevMode();

  return (
    <>
      {currentUser.data.admin && runsDevMode ? (
        <WorkflowView />
      ) : (
        <LegacyWorkflowForm id={parseInt(id, 10)} boreholeV2={borehole} />
      )}
    </>
  );
};
