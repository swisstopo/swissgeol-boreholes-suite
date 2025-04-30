import { useCallback } from "react";
import DataCards from "../../../../../components/dataCard/dataCards";
import { useRequiredParams } from "../../../../../hooks/useRequiredParams.ts";
import { sortByDepth } from "../../sorter.jsx";
import { FieldMeasurement as FieldMeasurementType, getFieldMeasurements } from "./FieldMeasurement.ts";
import FieldMeasurementDisplay from "./fieldMeasurementDisplay.js";
import FieldMeasurementInput from "./fieldMeasurementInput.js";

export const FieldMeasurement = () => {
  const { id: boreholeId } = useRequiredParams<{ id: string }>();
  const renderInput = useCallback(
    (props: { item: FieldMeasurementType; parentId: number }) => <FieldMeasurementInput {...props} />,
    [],
  );
  const renderDisplay = useCallback(
    (props: { item: FieldMeasurementType; editingEnabled: boolean }) => <FieldMeasurementDisplay {...props} />,
    [],
  );
  const sortDisplayed = useCallback(
    (a: FieldMeasurementType, b: FieldMeasurementType) => sortByDepth(a, b, "fromDepthM", "toDepthM"),
    [],
  );

  return (
    <DataCards<FieldMeasurementType>
      parentId={parseInt(boreholeId)}
      getData={getFieldMeasurements}
      cyLabel="fieldMeasurement"
      addLabel="addFieldMeasurement"
      emptyLabel="msgFieldMeasurementsEmpty"
      renderInput={renderInput}
      renderDisplay={renderDisplay}
      sortDisplayed={sortDisplayed}
    />
  );
};
