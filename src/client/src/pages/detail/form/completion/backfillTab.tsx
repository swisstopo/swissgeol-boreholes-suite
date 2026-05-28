import { useCallback } from "react";
import { getBackfills } from "../../../../api/fetchApiV2.ts";
import { DataCards } from "../../../../components/dataCard/dataCards.tsx";
import { sortByDepth } from "../sorter.jsx";
import BackfillDisplay from "./backfillDisplay.tsx";
import BackfillInput from "./backfillInput.tsx";
import { Backfill, CompletionTabProps } from "./completionInterfaces.ts";

export const BackfillTab = ({ completionId }: CompletionTabProps) => {
  const renderInput = useCallback((props: { item: Backfill; parentId: number }) => <BackfillInput {...props} />, []);
  const renderDisplay = useCallback((props: { item: Backfill }) => <BackfillDisplay {...props} />, []);
  const sortDisplayed = useCallback((a: Backfill, b: Backfill) => {
    const aName = a.casingId ? a.casing?.name : null;
    const bName = b.casingId ? b.casing?.name : null;
    if (aName !== bName) {
      return (aName ?? "") < (bName ?? "") ? -1 : 1;
    } else {
      return sortByDepth(a, b, "fromDepth", "toDepth");
    }
  }, []);

  return (
    <DataCards<Backfill>
      parentId={completionId}
      getData={getBackfills}
      cyLabel="backfill"
      addLabel="addBackfill"
      emptyLabel="msgBackfillEmpty"
      renderInput={renderInput}
      renderDisplay={renderDisplay}
      sortDisplayed={sortDisplayed}
    />
  );
};
