import React from "react";
import {
  getCasings,
  addCasing,
  updateCasing,
  deleteCasing,
} from "../../../../api/fetchApiV2";
import { DataCards } from "../../../../components/dataCard/dataCards";
import CasingInput from "./casingInput";
import CasingDisplay from "./casingDisplay";

export const extractCasingDepth = casing => {
  var min = null;
  var max = null;
  if (casing?.casingElements != null) {
    casing.casingElements.forEach(element => {
      if (
        element?.fromDepth != null &&
        (min === null || element.fromDepth < min)
      ) {
        min = element.fromDepth;
      }
      if (element?.toDepth != null && (max === null || element.toDepth > max)) {
        max = element.toDepth;
      }
    });
  }
  return { min, max };
};

const Casing = ({ isEditable, completionId }) => {
  return (
    <DataCards
      isEditable={isEditable}
      parentId={completionId}
      getData={getCasings}
      addData={addCasing}
      updateData={updateCasing}
      deleteData={deleteCasing}
      addLabel="addCasing"
      emptyLabel="msgCasingEmpty"
      renderInput={props => <CasingInput {...props} />}
      renderDisplay={props => <CasingDisplay {...props} />}
      sortDisplayed={(a, b) => {
        var aDepth = extractCasingDepth(a);
        var bDepth = extractCasingDepth(b);

        var minDiff = aDepth.min - bDepth.min;
        if (minDiff !== 0) {
          return minDiff;
        } else {
          return aDepth.max - bDepth.max;
        }
      }}
    />
  );
};
export default React.memo(Casing);
