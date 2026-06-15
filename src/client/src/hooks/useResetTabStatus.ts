import { GenericWorkflowSelection } from "@swissgeol/ui-core";
import { useBorehole } from "../api/borehole.ts";
import { TabName, TabType, useWorkflowMutation } from "../pages/detail/form/workflow/workflow.ts";
import { useRequiredId } from "./useRequiredId.ts";

export const useResetTabStatus = (tabsToReset: TabName[]) => {
  const id = useRequiredId();
  const { data: borehole, isLoading } = useBorehole(id);
  const {
    updateTabStatus: { mutate: updateTabStatus },
  } = useWorkflowMutation();

  if (isLoading || !borehole) return () => {};

  return () => {
    const anyTabIsReviewed = tabsToReset.some(tab => borehole?.workflow?.reviewedTabs?.[tab] === true);
    const anyTabIsPublished = tabsToReset.some(tab => borehole?.workflow?.publishedTabs?.[tab] === true);

    if (!anyTabIsReviewed && !anyTabIsPublished) return;

    const changes: Partial<GenericWorkflowSelection> = {};
    tabsToReset.forEach(tab => {
      changes[tab] = false;
    });

    if (anyTabIsReviewed) {
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
