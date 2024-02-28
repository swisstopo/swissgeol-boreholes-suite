import React from "react";
import {
  getInstrumentation,
  addInstrumentation,
  updateInstrumentation,
  deleteInstrumentation,
} from "../../../../api/fetchApiV2";
import { DataCards } from "../../../../components/dataCard/dataCards";
import InstrumentationInput from "./instrumentationInput";
import InstrumentationDisplay from "./instrumentationDisplay";

const Instrumentation = ({ isEditable, completionId }) => {
  return (
    <DataCards
      isEditable={isEditable}
      parentId={completionId}
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
const MemoizedInstrumentation = React.memo(Instrumentation);
export default MemoizedInstrumentation;
