import { getSectionsByBoreholeId } from "../../../../api/fetchApiV2.ts";
import DataCards from "../../../../components/dataCard/dataCards.tsx";
import { useRequiredParams } from "../../../../hooks/useRequiredParams.ts";
import SectionDisplay from "./sectionDisplay.jsx";
import SectionInput from "./sectionInput.jsx";

const Sections = () => {
  const { id: boreholeId } = useRequiredParams();
  return (
    <DataCards
      parentId={boreholeId}
      getData={getSectionsByBoreholeId}
      cyLabel="section"
      addLabel="addSection"
      emptyLabel="msgSectionsEmpty"
      renderInput={props => <SectionInput {...props} />}
      renderDisplay={props => <SectionDisplay {...props} />}
      sortDisplayed={(a, b) =>
        a.sectionElements?.at(0)?.fromDepth - b?.sectionElements?.at(0)?.fromDepth || a.id - b.id
      }
    />
  );
};

export default Sections;
