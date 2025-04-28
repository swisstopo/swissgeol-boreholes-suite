import { FC } from "react";
import DataCards from "../../../../../components/dataCard/dataCards.js";
import { useRequiredParams } from "../../../../../hooks/useRequiredParams.ts";
import { sortByDepth } from "../../sorter.jsx";
import {
  getGroundwaterLevelMeasurements,
  GroundwaterLevelMeasurement as GroundwaterLevelMeasurementType,
} from "./GroundwaterLevelMeasurement.ts";
import GroundwaterLevelMeasurementDisplay from "./groundwaterLevelMeasurementDisplay.tsx";
import GroundwaterLevelMeasurementInput from "./groundwaterLevelMeasurementInput.tsx";

const GroundwaterLevelMeasurement: FC = () => {
  const { id: boreholeId } = useRequiredParams<{ id: string }>();

  return (
    <DataCards<GroundwaterLevelMeasurementType>
      parentId={parseInt(boreholeId)}
      getData={getGroundwaterLevelMeasurements}
      cyLabel="groundwaterLevelMeasurement"
      addLabel="addGroundwaterLevelMeasurement"
      emptyLabel="msgGroundwaterLevelMeasurementsEmpty"
      renderInput={props => <GroundwaterLevelMeasurementInput {...props} />}
      renderDisplay={props => <GroundwaterLevelMeasurementDisplay {...props} />}
      sortDisplayed={(a, b) => {
        return sortByDepth(a, b, "fromDepthM", "toDepthM");
      }}
    />
  );
};
export default GroundwaterLevelMeasurement;
