import { getInstrumentation } from "../../../../api/fetchApiV2.js";
import DataCards from "../../../../components/dataCard/dataCards.jsx";
import InstrumentationInput from "./instrumentationInput.jsx";
import InstrumentationDisplay from "./instrumentationDisplay.jsx";
import { sortByDepth } from "../../../../commons/sorter.jsx";

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
export default Instrumentation;
