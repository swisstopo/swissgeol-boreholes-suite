import { getFieldMeasurements } from "../../../../api/fetchApiV2";
import FieldMeasurementInput from "./fieldMeasurementInput";
import FieldMeasurementDisplay from "./fieldMeasurementDisplay";
import { DataCards } from "../../../../components/dataCard/dataCards";
import { sortByDepth } from "../../../sorter.jsx";

const FieldMeasurement = ({ isEditable, boreholeId }) => {
  return (
    <DataCards
      isEditable={isEditable}
      parentId={boreholeId}
      getData={getFieldMeasurements}
      cyLabel="fieldMeasurement"
      addLabel="addFieldmeasurement"
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
