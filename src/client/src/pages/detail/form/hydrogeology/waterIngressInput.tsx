import { FC } from "react";
import { addWaterIngress, updateWaterIngress } from "../../../../api/fetchApiV2.js";
import DataInputCard from "../../../../components/dataCard/dataInputCard.jsx";
import { FormContainer } from "../../../../components/form/form";
import { FormDomainSelect } from "../../../../components/form/formDomainSelect";
import { prepareCasingDataForSubmit } from "../completion/casingUtils.jsx";
import { hydrogeologySchemaConstants } from "./hydrogeologySchemaConstants";
import { ObservationType, WaterIngress, WaterIngressFormData } from "./Observation.ts";
import ObservationInput from "./observationInput.tsx";

const WaterIngressInput: FC<{ item: WaterIngress; parentId: number }> = ({ item, parentId }) => {
  const prepareFormDataForSubmit = (data: WaterIngressFormData) => {
    data = prepareCasingDataForSubmit(data);
    data?.startTime ? (data.startTime += ":00.000Z") : (data.startTime = "");
    data?.endTime ? (data.endTime += ":00.000Z") : (data.endTime = "");
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
          selected={item.conditionsId}
          schemaName={hydrogeologySchemaConstants.waterIngressConditions}
        />
      </FormContainer>
    </DataInputCard>
  );
};

export default WaterIngressInput;
