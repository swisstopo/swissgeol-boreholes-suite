import React from "react";
import {
  getWaterIngress,
  addWaterIngress,
  updateWaterIngress,
  deleteWaterIngress,
} from "../../../../api/fetchApiV2";
import WaterIngressInput from "./waterIngressInput";
import WaterIngressDisplay from "./waterIngressDisplay";
import { DataCards } from "../../../../components/dataCard/dataCards";

const WaterIngress = ({ isEditable, boreholeId }) => {
  return (
    <DataCards
      isEditable={isEditable}
      parentId={boreholeId}
      getData={getWaterIngress}
      addData={addWaterIngress}
      updateData={updateWaterIngress}
      deleteData={deleteWaterIngress}
      cyLabel="waterIngress"
      addLabel="addWaterIngress"
      emptyLabel="msgWateringressesEmpty"
      renderInput={props => <WaterIngressInput {...props} />}
      renderDisplay={props => <WaterIngressDisplay {...props} />}
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
export default WaterIngress;
