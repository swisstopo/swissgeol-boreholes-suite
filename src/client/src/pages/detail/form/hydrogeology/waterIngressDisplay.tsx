import { FC } from "react";
import { deleteWaterIngress } from "../../../../api/fetchApiV2";
import DataDisplayCard from "../../../../components/dataCard/dataDisplayCard";
import { FormContainer, FormDisplay, FormValueType } from "../../../../components/form/form";
import { WaterIngress } from "./Observation.ts";
import ObservationDisplay from "./observationDisplay.tsx";

const WaterIngressDisplay: FC<{ item: WaterIngress }> = ({ item }) => {
  return (
    <DataDisplayCard item={item} deleteData={deleteWaterIngress}>
      <ObservationDisplay observation={item} />
      <FormContainer direction="row">
        <FormDisplay label="quantity" value={item?.quantity} type={FormValueType.Domain} />
        <FormDisplay label="conditions" value={item?.conditions} type={FormValueType.Domain} />
      </FormContainer>
    </DataDisplayCard>
  );
};

export default WaterIngressDisplay;
