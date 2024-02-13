import React from "react";
import {
  getGroundwaterLevelMeasurements,
  addGroundwaterLevelMeasurement,
  updateGroundwaterLevelMeasurement,
  deleteGroundwaterLevelMeasurement,
} from "../../../../api/fetchApiV2";
import GroundwaterLevelMeasurementInput from "./groundwaterLevelMeasurementInput";
import GroundwaterLevelMeasurementDisplay from "./groundwaterLevelMeasurementDisplay";
import { DataCards } from "../../../../components/dataCard/dataCards";

const GroundwaterLevelMeasurement = ({ isEditable, boreholeId }) => {
  return (
    <DataCards
      isEditable={isEditable}
      parentId={boreholeId}
      getData={getGroundwaterLevelMeasurements}
      addData={addGroundwaterLevelMeasurement}
      updateData={updateGroundwaterLevelMeasurement}
      deleteData={deleteGroundwaterLevelMeasurement}
      addLabel="addGroundwaterLevelMeasurement"
      emptyLabel="msgGroundwaterLevelMeasurementsEmpty"
      renderInput={props => <GroundwaterLevelMeasurementInput {...props} />}
      renderDisplay={props => <GroundwaterLevelMeasurementDisplay {...props} />}
    />
  );
};
export default GroundwaterLevelMeasurement;
