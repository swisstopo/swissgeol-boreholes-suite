import { getBackfills } from "../../../../../api/fetchApiV2.js";
import DataCards from "../../../../../components/dataCard/dataCards.jsx";
import BackfillInput from "./backfillInput.jsx";
import BackfillDisplay from "./backfillDisplay.jsx";
import { sortByDepth } from "../../../../../commons/sorter.jsx";

const Backfill = ({ isEditable, completionId }) => {
  return (
    <DataCards
      isEditable={isEditable}
      parentId={completionId}
      getData={getBackfills}
      cyLabel="backfill"
      addLabel="addBackfill"
      emptyLabel="msgBackfillEmpty"
      renderInput={props => <BackfillInput {...props} />}
      renderDisplay={props => <BackfillDisplay {...props} />}
      sortDisplayed={(a, b) => {
        var aName = a.casingId ? a.casing?.name : null;
        var bName = b.casingId ? b.casing?.name : null;
        if (aName !== bName) {
          return aName < bName ? -1 : 1;
        } else {
          return sortByDepth(a, b, "fromDepth", "toDepth");
        }
      }}
    />
  );
};
export default Backfill;
