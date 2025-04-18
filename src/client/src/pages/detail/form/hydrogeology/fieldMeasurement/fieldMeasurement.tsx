import { useParams } from "react-router-dom";
import DataCards from "../../../../../components/dataCard/dataCards";
import { sortByDepth } from "../../sorter.jsx";
import { FieldMeasurement as FieldMeasurementType, getFieldMeasurements } from "./FieldMeasurement.ts";
import FieldMeasurementDisplay from "./fieldMeasurementDisplay.js";
import FieldMeasurementInput from "./fieldMeasurementInput.js";

export const FieldMeasurement = () => {
  const { id: boreholeId } = useParams<{ id: string }>();

  return (
    <DataCards<FieldMeasurementType>
      parentId={parseInt(boreholeId)}
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
