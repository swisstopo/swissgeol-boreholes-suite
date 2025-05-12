import { useCallback } from "react";
import { getInstrumentation } from "../../../../api/fetchApiV2.ts";
import DataCards from "../../../../components/dataCard/dataCards.tsx";
import { sortByDepth } from "../sorter.jsx";
import InstrumentationDisplay from "./instrumentationDisplay.jsx";
import InstrumentationInput from "./instrumentationInput.jsx";

const Instrumentation = ({ completionId }) => {
  const renderInput = useCallback(props => <InstrumentationInput {...props} />, []);
  const renderDisplay = useCallback(props => <InstrumentationDisplay {...props} />, []);
  const sortDisplayed = useCallback((a, b) => sortByDepth(a, b, "fromDepth", "toDepth"), []);

  return (
    <DataCards
      parentId={completionId}
      getData={getInstrumentation}
      cyLabel="instrumentation"
      addLabel="addInstrument"
      emptyLabel="msgInstrumentsEmpty"
      renderInput={renderInput}
      renderDisplay={renderDisplay}
      sortDisplayed={sortDisplayed}
    />
  );
};
export default Instrumentation;
