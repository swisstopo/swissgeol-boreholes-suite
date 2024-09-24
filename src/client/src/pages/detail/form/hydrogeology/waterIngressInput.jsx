import ObservationInput from "./observationInput";
import { ObservationType } from "./observationType";
import { hydrogeologySchemaConstants } from "./hydrogeologySchemaConstants";
import { prepareCasingDataForSubmit } from "../completion/casingUtils.jsx";
import DataInputCard from "../../../../components/dataCard/dataInputCard.jsx";
import { FormContainer } from "../../../../components/form/form";
import { addWaterIngress, updateWaterIngress } from "../../../../api/fetchApiV2.js";
import { FormDomainSelect } from "../../../../components/form/formDomainSelect";

const WaterIngressInput = props => {
  const { item, parentId } = props;

  const prepareFormDataForSubmit = data => {
    data = prepareCasingDataForSubmit(data);
    data?.startTime ? (data.startTime += ":00.000Z") : (data.startTime = null);
    data?.endTime ? (data.endTime += ":00.000Z") : (data.endTime = null);
    data.type = ObservationType.waterIngress;
    data.boreholeId = parentId;
    if (data.conditionsId === "") {
      data.conditionsId = null;
    }
    if (data.reliabilityId === "") {
      data.reliabilityId = null;
    }
    delete data.reliability;
    return data;
  };

  return (
    <DataInputCard
      item={item}
      addData={addWaterIngress}
      updateData={updateWaterIngress}
      promptLabel="waterIngress"
      prepareFormDataForSubmit={prepareFormDataForSubmit}>
      <ObservationInput observation={item} boreholeId={parentId} />
      <FormContainer direction="row" sx={{ paddingTop: "10px" }}>
        <FormDomainSelect
          fieldName="quantityId"
          label="quantity"
          selected={item.quantityId}
          required={true}
          schemaName={hydrogeologySchemaConstants.waterIngressQuantity}
        />
        <FormDomainSelect
          fieldName="conditionsId"
          label="conditions"
          selected={item.conditionsId}
          schemaName={hydrogeologySchemaConstants.waterIngressConditions}
        />
      </FormContainer>
    </DataInputCard>
  );
};

export default WaterIngressInput;
