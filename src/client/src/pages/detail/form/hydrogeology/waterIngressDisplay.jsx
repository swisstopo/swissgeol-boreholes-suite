import { FormDisplay, FormValueType } from "../../../../components/form/form";
import DataDisplayCard from "../../../../components/dataCard/dataDisplayCard";
import ObservationDisplay from "./observationDisplay";
import { deleteWaterIngress } from "../../../../api/fetchApiV2";
import { StackFullWidth } from "../../../../components/styledComponents.ts";

const WaterIngressDisplay = props => {
  const { item, isEditable } = props;

  return (
    <DataDisplayCard item={item} isEditable={isEditable} deleteData={deleteWaterIngress}>
      <ObservationDisplay observation={item} />
      <StackFullWidth direction="row" spacing={1}>
        <FormDisplay label="quantity" value={item?.quantity} type={FormValueType.Domain} />
        <FormDisplay label="conditions" value={item?.conditions} type={FormValueType.Domain} />
      </StackFullWidth>
    </DataDisplayCard>
  );
};

export default WaterIngressDisplay;
