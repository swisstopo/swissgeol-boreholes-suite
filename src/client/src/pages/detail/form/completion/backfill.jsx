import { useCallback } from "react";
import { getBackfills } from "../../../../api/fetchApiV2.ts";
import DataCards from "../../../../components/dataCard/dataCards.tsx";
import { sortByDepth } from "../sorter.jsx";
import BackfillDisplay from "./backfillDisplay.jsx";
import BackfillInput from "./backfillInput.jsx";

const Backfill = ({ completionId }) => {
  const renderInput = useCallback(props => <BackfillInput {...props} />, []);
  const renderDisplay = useCallback(props => <BackfillDisplay {...props} />, []);
  const sortDisplayed = useCallback((a, b) => {
    const aName = a.casingId ? a.casing?.name : null;
    const bName = b.casingId ? b.casing?.name : null;
    if (aName !== bName) {
      return aName < bName ? -1 : 1;
    } else {
      return sortByDepth(a, b, "fromDepth", "toDepth");
    }
  }, []);

  return (
    <DataCards
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
export default Backfill;
