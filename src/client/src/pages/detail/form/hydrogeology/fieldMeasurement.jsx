import FieldMeasurementInput from "./fieldMeasurementInput";
import FieldMeasurementDisplay from "./fieldMeasurementDisplay";
import { getFieldMeasurements } from "../../../../api/fetchApiV2.js";
import DataCards from "../../../../components/dataCard/dataCards.jsx";
import { sortByDepth } from "../../../../commons/sorter.jsx";

const FieldMeasurement = ({ isEditable, boreholeId }) => {
  return (
    <DataCards
      isEditable={isEditable}
      parentId={boreholeId}
      getData={getFieldMeasurements}
      cyLabel="fieldMeasurement"
      addLabel="addFieldMeasurement"
      emptyLabel="msgFieldMeasurementsEmpty"
      renderInput={props => <FieldMeasurementInput {...props} />}
      renderDisplay={props => <FieldMeasurementDisplay {...props} />}
      sortDisplayed={(a, b) => {
        return sortByDepth(a, b, "fromDepthM", "toDepthM");
      }}
    />
  );
};
export default FieldMeasurement;
