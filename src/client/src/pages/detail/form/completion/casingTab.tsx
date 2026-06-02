import { useCallback } from "react";
import { getCasings } from "../../../../api/fetchApiV2.ts";
import { DataCards } from "../../../../components/dataCard/dataCards.tsx";
import { sortByDepth } from "../sorter.jsx";
import CasingDisplay from "./casingDisplay.tsx";
import CasingInput from "./casingInput.tsx";
import { extractCasingDepth } from "./casingUtils.tsx";
import { Casing, CompletionTabProps } from "./completionInterfaces.ts";

export const CasingTab = ({ completionId }: CompletionTabProps) => {
  const renderInput = useCallback((props: { item: Casing; parentId: number }) => <CasingInput {...props} />, []);
  const renderDisplay = useCallback((props: { item: Casing }) => <CasingDisplay {...props} />, []);
  const sortDisplayed = useCallback((a: Casing, b: Casing) => {
    const aDepth = extractCasingDepth(a);
    const bDepth = extractCasingDepth(b);
    return sortByDepth(aDepth, bDepth, "min", "max");
  }, []);

  return (
    <DataCards<Casing>
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
