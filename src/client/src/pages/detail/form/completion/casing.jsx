import { useCallback } from "react";
import { getCasings } from "../../../../api/fetchApiV2.ts";
import DataCards from "../../../../components/dataCard/dataCards.tsx";
import { sortByDepth } from "../sorter.jsx";
import CasingDisplay from "./casingDisplay.jsx";
import CasingInput from "./casingInput.jsx";
import { extractCasingDepth } from "./casingUtils.jsx";

const Casing = ({ completionId }) => {
  const renderInput = useCallback(props => <CasingInput {...props} />, []);
  const renderDisplay = useCallback(props => <CasingDisplay {...props} />, []);
  const sortDisplayed = useCallback((a, b) => {
    const aDepth = extractCasingDepth(a);
    const bDepth = extractCasingDepth(b);
    return sortByDepth(aDepth, bDepth, "min", "max");
  }, []);

  return (
    <DataCards
      parentId={completionId}
      getData={getCasings}
      cyLabel="casing"
      addLabel="addCasing"
      emptyLabel="msgCasingEmpty"
      renderInput={renderInput}
      renderDisplay={renderDisplay}
      sortDisplayed={sortDisplayed}
    />
  );
};
export default Casing;
