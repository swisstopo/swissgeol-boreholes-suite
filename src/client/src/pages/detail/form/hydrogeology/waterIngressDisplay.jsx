import { deleteWaterIngress } from "../../../../api/fetchApiV2";
import DataDisplayCard from "../../../../components/dataCard/dataDisplayCard";
import { FormContainer, FormDisplay, FormValueType } from "../../../../components/form/form";
import ObservationDisplay from "./observationDisplay";

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
