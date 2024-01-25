import React from "react";
import {
  getBackfills,
  addBackfill,
  updateBackfill,
  deleteBackfill,
} from "../../../../api/fetchApiV2";
import { CompletionContentTab } from "./completionContentTab";
import BackfillInput from "./backfillInput";
import BackfillDisplay from "./backfillDisplay";

const Backfill = ({ isEditable, completionId }) => {
  return (
    <CompletionContentTab
      isEditable={isEditable}
      completionId={completionId}
      getData={getBackfills}
      addData={addBackfill}
      updateData={updateBackfill}
      deleteData={deleteBackfill}
      addLabel="addFilling"
      emptyLabel="msgBackfillEmpty"
      renderInput={props => <BackfillInput {...props} />}
      renderDisplay={props => <BackfillDisplay {...props} />}
    />
  );
};
export default React.memo(Backfill);
