import { getSectionsByBoreholeId } from "../../../../api/fetchApiV2";
import DataCards from "../../../../components/dataCard/dataCards";
import SectionDisplay from "./sectionDisplay";
import SectionInput from "./sectionInput";

const Sections = ({ isEditable, boreholeId }) => {
  return (
    <DataCards
      isEditable={isEditable}
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
