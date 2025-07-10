import { useBorehole } from "../api/borehole.ts";
import {
  TabName,
  TabStatusChangeRequest,
  TabType,
  useWorkflowMutation,
} from "../pages/detail/form/workflow/workflow.ts";
import { useRequiredParams } from "./useRequiredParams.ts";

export const useResetTabStatus = (tabsToReset: TabName[]) => {
  const { id } = useRequiredParams<{ id: string }>();
  const { data: borehole } = useBorehole(parseInt(id, 10));
  const {
    updateTabStatus: { mutate: updateTabStatus },
  } = useWorkflowMutation();

  return () => {
    const anyTabIsReviewd = tabsToReset.some(tab => borehole.workflow?.reviewedTabs[tab] === true);

    if (!anyTabIsReviewd) return;

    const changes: Record<TabName, boolean> = {};
    tabsToReset.forEach(tab => {
      changes[tab] = false;
    });

    const tabStatusChangeRequest: TabStatusChangeRequest = {
      boreholeId: borehole.id,
      tab: TabType.Reviewed,
      changes,
    };
    updateTabStatus(tabStatusChangeRequest);
  };
};
