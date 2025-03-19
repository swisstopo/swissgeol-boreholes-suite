import { useParams } from "react-router-dom";
import { getSectionsByBoreholeId } from "../../../../api/fetchApiV2.js";
import DataCards from "../../../../components/dataCard/dataCards.tsx";
import SectionDisplay from "./sectionDisplay.jsx";
import SectionInput from "./sectionInput.jsx";

const Sections = () => {
  const { id: boreholeId } = useParams();
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
