import React from "react";
import {
  getHydrotests,
  addHydrotest,
  updateHydrotest,
  deleteHydrotest,
} from "../../../../api/fetchApiV2";
import HydrotestInput from "./hydrotestInput";
import HydrotestDisplay from "./hydrotestDisplay";
import { DataCards } from "../../../../components/dataCard/dataCards";

const Hydrotest = ({ isEditable, boreholeId }) => {
  return (
    <DataCards
      isEditable={isEditable}
      parentId={boreholeId}
      getData={getHydrotests}
      addData={addHydrotest}
      updateData={updateHydrotest}
      deleteData={deleteHydrotest}
      addLabel="addHydrotest"
      emptyLabel="msgHydrotestEmpty"
      renderInput={props => <HydrotestInput {...props} />}
      renderDisplay={props => <HydrotestDisplay {...props} />}
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
export default Hydrotest;
