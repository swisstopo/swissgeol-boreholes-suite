import { useCallback } from "react";
import { getSectionsByBoreholeId } from "../../../../api/fetchApiV2.ts";
import { DataCards } from "../../../../components/dataCard/dataCards.tsx";
import { useRequiredId } from "../../../../hooks/useRequiredId.ts";
import SectionDisplay from "./sectionDisplay.jsx";
import SectionInput from "./sectionInput.jsx";

const Sections = () => {
  const boreholeId = useRequiredId();

  const renderInput = useCallback(props => <SectionInput {...props} />, []);
  const renderDisplay = useCallback(props => <SectionDisplay {...props} />, []);
  const sortDisplayed = useCallback(
    (a, b) => a.sectionElements?.at(0)?.fromDepth - b?.sectionElements?.at(0)?.fromDepth || a.id - b.id,
    [],
  );

  return (
    <DataCards
      parentId={boreholeId}
      getData={getSectionsByBoreholeId}
      cyLabel="section"
      addLabel="addSection"
      emptyLabel="msgSectionsEmpty"
      renderInput={renderInput}
      renderDisplay={renderDisplay}
      sortDisplayed={sortDisplayed}
    />
  );
};

export default Sections;
