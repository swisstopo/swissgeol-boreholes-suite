import { Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import ObservationInput from "./observationInput";
import { ObservationType } from "./observationType";
import { hydrogeologySchemaConstants } from "./hydrogeologySchemaConstants";
import { prepareCasingDataForSubmit } from "../completion/casingUtils.jsx";
import DataInputCard from "../../../../components/dataCard/dataInputCard.jsx";
import { FormSelect } from "../../../../components/form/form.js";
import { addWaterIngress, updateWaterIngress, useDomains } from "../../../../api/fetchApiV2.js";

const WaterIngressInput = props => {
  const { item, parentId } = props;
  const domains = useDomains();
  const { i18n } = useTranslation();

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
      <Stack direction="row" sx={{ paddingTop: "10px" }}>
        <FormSelect
          fieldName="quantityId"
          label="quantity"
          selected={item.quantityId}
          required={true}
          values={domains?.data
            ?.filter(d => d.schema === hydrogeologySchemaConstants.waterIngressQuantity)
            .sort((a, b) => a.order - b.order)
            .map(d => ({
              key: d.id,
              name: d[i18n.language],
            }))}
        />
        <FormSelect
          fieldName="conditionsId"
          label="conditions"
          selected={item.conditionsId}
          values={domains?.data
            ?.filter(d => d.schema === hydrogeologySchemaConstants.waterIngressConditions)
            .sort((a, b) => a.order - b.order)
            .map(d => ({
              key: d.id,
              name: d[i18n.language],
            }))}
        />
      </Stack>
    </DataInputCard>
  );
};

export default WaterIngressInput;
