import { getInstrumentation } from "../../../../api/fetchApiV2.js";
import DataCards from "../../../../components/dataCard/dataCards.tsx";
import { sortByDepth } from "../sorter.jsx";
import InstrumentationDisplay from "./instrumentationDisplay.jsx";
import InstrumentationInput from "./instrumentationInput.jsx";

const Instrumentation = ({ completionId }) => {
  return (
    <DataCards
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
export default Instrumentation;
