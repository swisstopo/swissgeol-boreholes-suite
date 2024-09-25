import { getCasings } from "../../../../api/fetchApiV2.js";
import DataCards from "../../../../components/dataCard/dataCards.jsx";
import { sortByDepth } from "../sorter.jsx";
import CasingDisplay from "./casingDisplay.jsx";
import CasingInput from "./casingInput.jsx";
import { extractCasingDepth } from "./casingUtils.jsx";

const Casing = ({ isEditable, completionId }) => {
  return (
    <DataCards
      isEditable={isEditable}
      parentId={completionId}
      getData={getCasings}
      cyLabel="casing"
      addLabel="addCasing"
      emptyLabel="msgCasingEmpty"
      renderInput={props => <CasingInput {...props} />}
      renderDisplay={props => <CasingDisplay {...props} />}
      sortDisplayed={(a, b) => {
        var aDepth = extractCasingDepth(a);
        var bDepth = extractCasingDepth(b);
        return sortByDepth(aDepth, bDepth, "min", "max");
      }}
    />
  );
};
export default Casing;
