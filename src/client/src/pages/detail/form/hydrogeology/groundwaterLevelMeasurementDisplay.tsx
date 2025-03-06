import { deleteGroundwaterLevelMeasurement } from "../../../../api/fetchApiV2.js";
import DataDisplayCard from "../../../../components/dataCard/dataDisplayCard.jsx";
import { FormContainer, FormDisplay, FormValueType } from "../../../../components/form/form";
import { GroundwaterLevelMeasurementDisplayProps } from "./Observation.ts";
import ObservationDisplay from "./observationDisplay.tsx";

const GroundwaterLevelMeasurementDisplay = ({ item }: GroundwaterLevelMeasurementDisplayProps) => {
  return (
    <DataDisplayCard item={item} deleteData={deleteGroundwaterLevelMeasurement}>
      <ObservationDisplay observation={item} showDepthInputs={false} />
      <FormContainer direction="row">
        <FormDisplay label="gwlm_kind" value={item?.kind} type={FormValueType.Domain} />
      </FormContainer>
      <FormContainer direction="row">
        <FormDisplay label="gwlm_levelmasl" value={item?.levelMasl} type={FormValueType.Number} />
        <FormDisplay label="gwlm_levelm" value={item?.levelM} type={FormValueType.Number} />
      </FormContainer>
    </DataDisplayCard>
  );
};

export default GroundwaterLevelMeasurementDisplay;
