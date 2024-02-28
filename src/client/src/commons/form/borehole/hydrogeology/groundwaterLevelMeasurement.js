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
      cyLabel="groundwaterLevelMeasurement"
      addLabel="addGroundwaterLevelMeasurement"
      emptyLabel="msgGroundwaterLevelMeasurementsEmpty"
      renderInput={props => <GroundwaterLevelMeasurementInput {...props} />}
      renderDisplay={props => <GroundwaterLevelMeasurementDisplay {...props} />}
      sortDisplayed={(a, b) => {
        var minDiff = a.fromDepthM - b.fromDepthM;
        if (minDiff !== 0) {
          return minDiff;
        } else {
          return a.toDepthM - b.toDepthM;
        }
      }}
    />
  );
};
export default GroundwaterLevelMeasurement;
