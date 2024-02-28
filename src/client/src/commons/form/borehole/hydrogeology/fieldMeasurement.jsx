import {
  getFieldMeasurements,
  addFieldMeasurement,
  updateFieldMeasurement,
  deleteFieldMeasurement,
} from "../../../../api/fetchApiV2";
import FieldMeasurementInput from "./fieldMeasurementInput";
import FieldMeasurementDisplay from "./fieldMeasurementDisplay";
import { DataCards } from "../../../../components/dataCard/dataCards";

const FieldMeasurement = ({ isEditable, boreholeId }) => {
  return (
    <DataCards
      isEditable={isEditable}
      parentId={boreholeId}
      getData={getFieldMeasurements}
      addData={addFieldMeasurement}
      updateData={updateFieldMeasurement}
      deleteData={deleteFieldMeasurement}
      addLabel="addFieldmeasurement"
      emptyLabel="msgFieldMeasurementsEmpty"
      renderInput={props => <FieldMeasurementInput {...props} />}
      renderDisplay={props => <FieldMeasurementDisplay {...props} />}
    />
  );
};
export default FieldMeasurement;
