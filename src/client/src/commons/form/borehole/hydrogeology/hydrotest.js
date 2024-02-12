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
    />
  );
};
export default Hydrotest;
