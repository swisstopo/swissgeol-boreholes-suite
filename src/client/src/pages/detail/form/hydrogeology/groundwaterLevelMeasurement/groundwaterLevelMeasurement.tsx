import { FC, useCallback } from "react";
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
  const renderInput = useCallback(
    (props: { item: GroundwaterLevelMeasurementType; parentId: number }) => (
      <GroundwaterLevelMeasurementInput {...props} />
    ),
    [],
  );
  const renderDisplay = useCallback(
    (props: { item: GroundwaterLevelMeasurementType; editingEnabled: boolean }) => (
      <GroundwaterLevelMeasurementDisplay {...props} />
    ),
    [],
  );
  const sortDisplayed = useCallback(
    (a: GroundwaterLevelMeasurementType, b: GroundwaterLevelMeasurementType) =>
      sortByDepth(a, b, "fromDepthM", "toDepthM"),
    [],
  );

  return (
    <DataCards<GroundwaterLevelMeasurementType>
      parentId={parseInt(boreholeId)}
      getData={getGroundwaterLevelMeasurements}
      cyLabel="groundwaterLevelMeasurement"
      addLabel="addGroundwaterLevelMeasurement"
      emptyLabel="msgGroundwaterLevelMeasurementsEmpty"
      renderInput={renderInput}
      renderDisplay={renderDisplay}
      sortDisplayed={sortDisplayed}
    />
  );
};
export default GroundwaterLevelMeasurement;
