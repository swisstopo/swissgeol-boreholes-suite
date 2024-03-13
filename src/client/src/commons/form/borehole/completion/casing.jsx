import React from "react";
import { getCasings } from "../../../../api/fetchApiV2";
import { DataCards } from "../../../../components/dataCard/dataCards";
import CasingInput from "./casingInput";
import CasingDisplay from "./casingDisplay";
import { extractCasingDepth } from "./casingUtils.jsx";
import { sortByDepth } from "../../../sorter.jsx";

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
const MemoizedCasing = React.memo(Casing);
export default MemoizedCasing;
