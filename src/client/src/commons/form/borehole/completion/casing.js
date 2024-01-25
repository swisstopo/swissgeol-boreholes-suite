import React from "react";
import {
  getCasings,
  addCasing,
  updateCasing,
  deleteCasing,
} from "../../../../api/fetchApiV2";
import { CompletionContentTab } from "./completionContentTab";
import CasingInput from "./casingInput";
import CasingDisplay from "./casingDisplay";

const Casing = ({ isEditable, completionId }) => {
  return (
    <CompletionContentTab
      isEditable={isEditable}
      completionId={completionId}
      getData={getCasings}
      addData={addCasing}
      updateData={updateCasing}
      deleteData={deleteCasing}
      addLabel="addCasing"
      emptyLabel="msgCasingEmpty"
      renderInput={props => <CasingInput {...props} />}
      renderDisplay={props => <CasingDisplay {...props} />}
    />
  );
};
export default React.memo(Casing);
