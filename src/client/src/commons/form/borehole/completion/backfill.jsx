import React from "react";
import { getBackfills, addBackfill, updateBackfill, deleteBackfill } from "../../../../api/fetchApiV2";
import { DataCards } from "../../../../components/dataCard/dataCards";
import BackfillInput from "./backfillInput";
import BackfillDisplay from "./backfillDisplay";
import { sortByDepth } from "../../../sorter.jsx";

const Backfill = ({ isEditable, completionId }) => {
  return (
    <DataCards
      isEditable={isEditable}
      parentId={completionId}
      getData={getBackfills}
      addData={addBackfill}
      updateData={updateBackfill}
      deleteData={deleteBackfill}
      cyLabel="backfill"
      addLabel="addFilling"
      emptyLabel="msgFillingEmpty"
      renderInput={props => <BackfillInput {...props} />}
      renderDisplay={props => <BackfillDisplay {...props} />}
      sortDisplayed={(a, b) => {
        return sortByDepth(a, b, "fromDepth", "toDepth");
      }}
    />
  );
};
const MemoizedBackfill = React.memo(Backfill);
export default MemoizedBackfill;
