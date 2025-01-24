import { FC } from "react";
import { useParams } from "react-router-dom";
import { getGroundwaterLevelMeasurements } from "../../../../api/fetchApiV2.js";
import DataCards from "../../../../components/dataCard/dataCards.jsx";
import { sortByDepth } from "../sorter.jsx";
import GroundwaterLevelMeasurementDisplay from "./groundwaterLevelMeasurementDisplay";
import GroundwaterLevelMeasurementInput from "./groundwaterLevelMeasurementInput";
import { GroundwaterLevelMeasurementDisplayProps, GroundwaterLevelMeasurementInputProps } from "./Observation.ts";

const GroundwaterLevelMeasurement: FC = () => {
  const { id: boreholeId } = useParams<{ id: string }>();

  return (
    <DataCards
      parentId={boreholeId}
      getData={getGroundwaterLevelMeasurements}
      cyLabel="groundwaterLevelMeasurement"
      addLabel="addGroundwaterLevelMeasurement"
      emptyLabel="msgGroundwaterLevelMeasurementsEmpty"
      renderInput={(props: GroundwaterLevelMeasurementInputProps) => <GroundwaterLevelMeasurementInput {...props} />}
      renderDisplay={(props: GroundwaterLevelMeasurementDisplayProps) => (
        <GroundwaterLevelMeasurementDisplay {...props} />
      )}
      sortDisplayed={(a: number, b: number) => {
        return sortByDepth(a, b, "fromDepthM", "toDepthM");
      }}
    />
  );
};
export default GroundwaterLevelMeasurement;
