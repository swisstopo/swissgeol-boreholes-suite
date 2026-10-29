import { useCallback } from "react";
import { getSectionsByBoreholeId } from "../../../../api/fetchApiV2.ts";
import { Section } from "../../../../api/generated";
import { DataCards } from "../../../../components/dataCard/dataCards.tsx";
import { useRequiredId } from "../../../../hooks/useRequiredId.ts";
import SectionDisplay from "./sectionDisplay.tsx";
import SectionInput from "./sectionInput.tsx";

const Sections = () => {
  const boreholeId = useRequiredId();

  const renderInput = useCallback((props: { item: Section; parentId: number }) => <SectionInput {...props} />, []);
  const renderDisplay = useCallback((props: { item: Section }) => <SectionDisplay {...props} />, []);
  const sortDisplayed = useCallback(
    (a: Section, b: Section) =>
      Number(a.sectionElements?.at(0)?.fromDepth) - Number(b?.sectionElements?.at(0)?.fromDepth) || a.id - b.id,
    [],
  );

  return (
    <DataCards<Section>
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
