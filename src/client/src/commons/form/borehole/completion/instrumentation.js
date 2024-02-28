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
      cyLabel="instrumentation"
      addLabel="addInstrument"
      emptyLabel="msgInstrumentsEmpty"
      renderInput={props => <InstrumentationInput {...props} />}
      renderDisplay={props => <InstrumentationDisplay {...props} />}
      sortDisplayed={(a, b) => {
        var minDiff = a.fromDepth - b.fromDepth;
        if (minDiff !== 0) {
          return minDiff;
        } else {
          return a.toDepth - b.toDepth;
        }
      }}
    />
  );
};
export default React.memo(Instrumentation);
