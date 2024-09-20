import { FormContainer, FormDisplay, FormValueType } from "../../../../components/form/form";
import DataDisplayCard from "../../../../components/dataCard/dataDisplayCard";
import ObservationDisplay from "./observationDisplay";
import { deleteWaterIngress } from "../../../../api/fetchApiV2";

const WaterIngressDisplay = props => {
  const { item, isEditable } = props;

  return (
    <DataDisplayCard item={item} isEditable={isEditable} deleteData={deleteWaterIngress}>
      <ObservationDisplay observation={item} />
      <FormContainer direction="row">
        <FormDisplay label="quantity" value={item?.quantity} type={FormValueType.Domain} />
        <FormDisplay label="conditions" value={item?.conditions} type={FormValueType.Domain} />
      </FormContainer>
    </DataDisplayCard>
  );
};

export default WaterIngressDisplay;
