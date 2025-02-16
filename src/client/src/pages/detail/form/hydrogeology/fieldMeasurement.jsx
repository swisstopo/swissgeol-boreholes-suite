import { useParams } from "react-router-dom";
import { getFieldMeasurements } from "../../../../api/fetchApiV2.js";
import DataCards from "../../../../components/dataCard/dataCards.jsx";
import { sortByDepth } from "../sorter.jsx";
import FieldMeasurementDisplay from "./fieldMeasurementDisplay.jsx";
import FieldMeasurementInput from "./fieldMeasurementInput.jsx";

const FieldMeasurement = () => {
  const { id: boreholeId } = useParams();

  return (
    <DataCards
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
