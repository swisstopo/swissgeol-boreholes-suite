import { FC } from "react";
import DataInputCard from "../../../../../components/dataCard/dataInputCard.js";
import { FormContainer } from "../../../../../components/form/form.ts";
import { FormDomainSelect } from "../../../../../components/form/formDomainSelect.tsx";
import { prepareCasingDataForSubmit } from "../../completion/casingUtils.jsx";
import { hydrogeologySchemaConstants } from "../hydrogeologySchemaConstants.ts";
import { ObservationType, prepareObservationDataForSubmit } from "../Observation.ts";
import ObservationInput from "../observationInput.tsx";
import { addWaterIngress, updateWaterIngress, WaterIngress } from "./WaterIngress.ts";

const WaterIngressInput: FC<{ item: WaterIngress; parentId: number }> = ({ item, parentId }) => {
  const prepareFormDataForSubmit = (data: WaterIngress) => {
    data = prepareCasingDataForSubmit(data);
    data = prepareObservationDataForSubmit(data, parentId);
    data.type = ObservationType.waterIngress;
    if (data.conditionsId === "") {
      data.conditionsId = null;
    }
    return data;
  };

  return (
    <DataInputCard
      item={item}
      addData={addWaterIngress}
      updateData={updateWaterIngress}
      entityName="waterIngress"
      prepareFormDataForSubmit={prepareFormDataForSubmit}>
      <ObservationInput observation={item} />
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
          selected={item.conditionsId as number}
          schemaName={hydrogeologySchemaConstants.waterIngressConditions}
        />
      </FormContainer>
    </DataInputCard>
  );
};

export default WaterIngressInput;
