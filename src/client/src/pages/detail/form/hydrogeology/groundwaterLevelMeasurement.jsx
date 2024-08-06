import GroundwaterLevelMeasurementInput from "./groundwaterLevelMeasurementInput";
import GroundwaterLevelMeasurementDisplay from "./groundwaterLevelMeasurementDisplay";
import DataCards from "../../../../components/dataCard/dataCards.jsx";
import { getGroundwaterLevelMeasurements } from "../../../../api/fetchApiV2.js";
import { sortByDepth } from "../../../../commons/sorter.jsx";

const GroundwaterLevelMeasurement = ({ isEditable, boreholeId }) => {
  return (
    <DataCards
      isEditable={isEditable}
      parentId={boreholeId}
      getData={getGroundwaterLevelMeasurements}
      cyLabel="groundwaterLevelMeasurement"
      addLabel="addGroundwaterLevelMeasurement"
      emptyLabel="msgGroundwaterLevelMeasurementsEmpty"
      renderInput={props => <GroundwaterLevelMeasurementInput {...props} />}
      renderDisplay={props => <GroundwaterLevelMeasurementDisplay {...props} />}
      sortDisplayed={(a, b) => {
        return sortByDepth(a, b, "fromDepthM", "toDepthM");
      }}
    />
  );
};
export default GroundwaterLevelMeasurement;
