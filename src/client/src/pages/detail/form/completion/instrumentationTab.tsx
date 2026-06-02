import { useCallback } from "react";
import { getInstrumentation } from "../../../../api/fetchApiV2.ts";
import { DataCards } from "../../../../components/dataCard/dataCards.tsx";
import { sortByDepth } from "../sorter.jsx";
import { CompletionTabProps, Instrumentation } from "./completionInterfaces.ts";
import InstrumentationDisplay from "./instrumentationDisplay.tsx";
import InstrumentationInput from "./instrumentationInput.tsx";

export const InstrumentationTab = ({ completionId }: CompletionTabProps) => {
  const renderInput = useCallback(
    (props: { item: Instrumentation; parentId: number }) => <InstrumentationInput {...props} />,
    [],
  );
  const renderDisplay = useCallback((props: { item: Instrumentation }) => <InstrumentationDisplay {...props} />, []);
  const sortDisplayed = useCallback(
    (a: Instrumentation, b: Instrumentation) => sortByDepth(a, b, "fromDepth", "toDepth"),
    [],
  );

  return (
    <DataCards<Instrumentation>
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
