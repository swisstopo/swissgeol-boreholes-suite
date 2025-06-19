import { useSelector } from "react-redux";
import { useSearchParams } from "react-router-dom";
import { ReduxRootState, User } from "../../../../api-lib/ReduxStateInterfaces.ts";
import { useBorehole } from "../../../../api/borehole.ts";
import { useRequiredParams } from "../../../../hooks/useRequiredParams.ts";
import LegacyWorkflowForm from "./legacyWorkflow/legacyWorkflowForm";
import { WorkflowView } from "./workflowView.tsx";

export const WorkflowPanel = () => {
  const { id } = useRequiredParams<{ id: string }>();
  const { data: borehole } = useBorehole(parseInt(id, 10));
  const [searchParams] = useSearchParams();
  const currentUser: User = useSelector((state: ReduxRootState) => state.core_user);
  const hasDevFlag = searchParams.get("dev") === "true";
  return (
    <>
      {currentUser.data.admin && hasDevFlag ? (
        <WorkflowView />
      ) : (
        <LegacyWorkflowForm id={parseInt(id, 10)} boreholeV2={borehole} />
      )}
    </>
  );
};
