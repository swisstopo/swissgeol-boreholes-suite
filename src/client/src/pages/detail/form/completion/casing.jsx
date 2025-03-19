import { getCasings } from "../../../../api/fetchApiV2.js";
import DataCards from "../../../../components/dataCard/dataCards.tsx";
import { sortByDepth } from "../sorter.jsx";
import CasingDisplay from "./casingDisplay.jsx";
import CasingInput from "./casingInput.jsx";
import { extractCasingDepth } from "./casingUtils.jsx";

const Casing = ({ completionId }) => {
  return (
    <DataCards
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
