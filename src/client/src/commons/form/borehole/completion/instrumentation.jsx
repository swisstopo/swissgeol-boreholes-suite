import React from "react";
import { getInstrumentation } from "../../../../api/fetchApiV2";
import DataCards from "../../../../components/dataCard/dataCards";
import InstrumentationInput from "./instrumentationInput";
import InstrumentationDisplay from "./instrumentationDisplay";
import { sortByDepth } from "../../../sorter.jsx";

const Instrumentation = ({ isEditable, completionId }) => {
  return (
    <DataCards
      isEditable={isEditable}
      parentId={completionId}
      getData={getInstrumentation}
      cyLabel="instrumentation"
      addLabel="addInstrument"
      emptyLabel="msgInstrumentsEmpty"
      renderInput={props => <InstrumentationInput {...props} />}
      renderDisplay={props => <InstrumentationDisplay {...props} />}
      sortDisplayed={(a, b) => {
        return sortByDepth(a, b, "fromDepth", "toDepth");
      }}
    />
  );
};
const MemoizedInstrumentation = React.memo(Instrumentation);
export default MemoizedInstrumentation;
