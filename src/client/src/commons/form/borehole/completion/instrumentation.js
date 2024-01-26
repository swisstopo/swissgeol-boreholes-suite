import React from "react";
import {
  getInstrumentation,
  addInstrumentation,
  updateInstrumentation,
  deleteInstrumentation,
} from "../../../../api/fetchApiV2";
import { CompletionContentTab } from "./completionContentTab";
import InstrumentationInput from "./instrumentationInput";
import InstrumentationDisplay from "./instrumentationDisplay";

const Instrumentation = ({ isEditable, completionId }) => {
  return (
    <CompletionContentTab
      isEditable={isEditable}
      completionId={completionId}
      getData={getInstrumentation}
      addData={addInstrumentation}
      updateData={updateInstrumentation}
      deleteData={deleteInstrumentation}
      addLabel="addInstrument"
      emptyLabel="msgInstrumentsEmpty"
      renderInput={props => <InstrumentationInput {...props} />}
      renderDisplay={props => <InstrumentationDisplay {...props} />}
    />
  );
};
export default React.memo(Instrumentation);
