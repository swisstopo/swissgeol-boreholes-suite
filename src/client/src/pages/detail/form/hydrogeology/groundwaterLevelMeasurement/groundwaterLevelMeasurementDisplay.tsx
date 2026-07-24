import { FC } from "react";
import { GroundwaterLevelMeasurement } from "../../../../../api/generated";
import { DataDisplayCard } from "../../../../../components/dataCard/dataDisplayCard.js";
import { FormContainer, FormDisplay, FormValueType } from "../../../../../components/form/form.ts";
import ObservationDisplay from "../observationDisplay.tsx";
import { deleteGroundwaterLevelMeasurement } from "./GroundwaterLevelMeasurement.ts";

export const GroundwaterLevelMeasurementDisplay: FC<{ item: GroundwaterLevelMeasurement }> = ({ item }) => {
  return (
    <DataDisplayCard
      item={item}
      deleteData={deleteGroundwaterLevelMeasurement}
      entityName={"groundwaterLevelMeasurement"}>
      <ObservationDisplay observation={item} showDepthInputs={false} />
      <FormContainer direction="row">
        <FormDisplay label="gwlmKind" value={item?.kind} type={FormValueType.Domain} />
      </FormContainer>
      <FormContainer direction="row">
        <FormDisplay label="gwlmLevelM" value={item?.levelM} type={FormValueType.Number} />
        <FormDisplay label="gwlmLevelMasl" value={item?.levelMasl} type={FormValueType.Number} />
      </FormContainer>
    </DataDisplayCard>
  );
};
