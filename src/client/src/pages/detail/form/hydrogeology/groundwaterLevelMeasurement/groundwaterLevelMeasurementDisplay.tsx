import { FC } from "react";
import DataDisplayCard from "../../../../../components/dataCard/dataDisplayCard.js";
import { FormContainer, FormDisplay, FormValueType } from "../../../../../components/form/form.ts";
import ObservationDisplay from "../observationDisplay.tsx";
import { deleteGroundwaterLevelMeasurement, GroundwaterLevelMeasurement } from "./GroundwaterLevelMeasurement.ts";

export const GroundwaterLevelMeasurementDisplay: FC<{ item: GroundwaterLevelMeasurement }> = ({ item }) => {
  return (
    <DataDisplayCard item={item} deleteData={deleteGroundwaterLevelMeasurement}>
      <ObservationDisplay observation={item} showDepthInputs={false} />
      <FormContainer direction="row">
        <FormDisplay label="gwlm_kind" value={item?.kind} type={FormValueType.Domain} />
      </FormContainer>
      <FormContainer direction="row">
        <FormDisplay label="gwlm_levelmasl" value={item?.levelMasl} />
        <FormDisplay label="gwlm_levelm" value={item?.levelM} />
      </FormContainer>
    </DataDisplayCard>
  );
};

export default GroundwaterLevelMeasurementDisplay;
