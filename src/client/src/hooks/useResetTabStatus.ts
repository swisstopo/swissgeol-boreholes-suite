import { GenericWorkflowSelection } from "@swissgeol/ui-core";
import { useBorehole } from "../api/borehole.ts";
import { TabName, TabType, useWorkflowMutation } from "../pages/detail/form/workflow/workflow.ts";
import { useRequiredParams } from "./useRequiredParams.ts";

export const useResetTabStatus = (tabsToReset: TabName[]) => {
  const { id } = useRequiredParams<{ id: string }>();
  const { data: borehole } = useBorehole(parseInt(id, 10));
  const {
    updateTabStatus: { mutate: updateTabStatus },
  } = useWorkflowMutation();

  return () => {
    const anyTabIsReviewd = tabsToReset.some(tab => borehole.workflow?.reviewedTabs[tab] === true);
    const anyTabIsPublished = tabsToReset.some(tab => borehole.workflow?.publishedTabs[tab] === true);

    if (!anyTabIsReviewd && !anyTabIsPublished) return;

    const changes: Partial<GenericWorkflowSelection> = {};
    tabsToReset.forEach(tab => {
      changes[tab] = false;
    });

    if (anyTabIsReviewd) {
      updateTabStatus({
        boreholeId: borehole.id,
        tab: TabType.Reviewed,
        changes,
      });
    }

    if (anyTabIsPublished) {
      updateTabStatus({
        boreholeId: borehole.id,
        tab: TabType.Published,
        changes,
      });
    }
  };
};
