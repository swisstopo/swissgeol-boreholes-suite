import { FC } from "react";
import DataDisplayCard from "../../../../../components/dataCard/dataDisplayCard.tsx";
import { FormContainer, FormDisplay, FormValueType } from "../../../../../components/form/form.ts";
import ObservationDisplay from "../observationDisplay.tsx";
import { deleteWaterIngress, WaterIngress } from "./WaterIngress.ts";

const WaterIngressDisplay: FC<{ item: WaterIngress }> = ({ item }) => {
  return (
    <DataDisplayCard<WaterIngress> item={item} deleteData={deleteWaterIngress} entityName={"waterIngress"}>
      <ObservationDisplay observation={item} />
      <FormContainer direction="row">
        <FormDisplay label="quantity" value={item?.quantity} type={FormValueType.Domain} />
        <FormDisplay label="conditions" value={item?.conditions} type={FormValueType.Domain} />
      </FormContainer>
    </DataDisplayCard>
  );
};

export default WaterIngressDisplay;
