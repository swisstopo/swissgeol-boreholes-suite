import { useTranslation } from "react-i18next";

import {
  addGroundwaterLevelMeasurement,
  updateGroundwaterLevelMeasurement,
  useDomains,
} from "../../../../api/fetchApiV2";
import DataInputCard from "../../../../components/dataCard/dataInputCard.jsx";
import { FormContainer, FormInput, FormSelect, FormValueType } from "../../../../components/form/form";
import { prepareCasingDataForSubmit } from "../completion/casingUtils.jsx";
import { hydrogeologySchemaConstants } from "./hydrogeologySchemaConstants";
import ObservationInput from "./observationInput";
import { ObservationType } from "./observationType";

const GroundwaterLevelMeasurementInput = props => {
  const { item, parentId } = props;
  const domains = useDomains();
  const { i18n } = useTranslation();

  const prepareFormDataForSubmit = data => {
    data = prepareCasingDataForSubmit(data);
    data?.startTime ? (data.startTime += ":00.000Z") : (data.startTime = null);
    data?.endTime ? (data.endTime += ":00.000Z") : (data.endTime = null);
    data.type = ObservationType.groundwaterLevelMeasurement;
    data.boreholeId = parentId;

    if (data.casingId == null) {
      data.casingId = item.casingId;
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
      addData={addGroundwaterLevelMeasurement}
      updateData={updateGroundwaterLevelMeasurement}
      promptLabel="groundwaterLevelMeasurement"
      prepareFormDataForSubmit={prepareFormDataForSubmit}>
      <ObservationInput observation={item} boreholeId={parentId} />
      <FormContainer direction="row" sx={{ paddingTop: "10px" }}>
        <FormSelect
          fieldName="kindId"
          label="gwlm_kind"
          selected={item.kindId}
          required={true}
          values={domains?.data
            ?.filter(d => d.schema === hydrogeologySchemaConstants.groundwaterLevelMeasurementKind)
            .sort((a, b) => a.order - b.order)
            .map(d => ({
              key: d.id,
              name: d[i18n.language],
            }))}
        />
      </FormContainer>
      <FormContainer direction="row">
        <FormInput fieldName="levelMasl" label="gwlm_levelmasl" value={item.levelMasl} type={FormValueType.Number} />
        <FormInput fieldName="levelM" label="gwlm_levelm" value={item.levelM} type={FormValueType.Number} />
      </FormContainer>
    </DataInputCard>
  );
};

export default GroundwaterLevelMeasurementInput;
