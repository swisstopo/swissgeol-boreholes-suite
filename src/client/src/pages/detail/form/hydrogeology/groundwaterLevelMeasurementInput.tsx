import { addGroundwaterLevelMeasurement, updateGroundwaterLevelMeasurement } from "../../../../api/fetchApiV2";
import DataInputCard from "../../../../components/dataCard/dataInputCard.jsx";
import { FormContainer, FormInput, FormValueType } from "../../../../components/form/form";
import { FormDomainSelect } from "../../../../components/form/formDomainSelect";
import { prepareCasingDataForSubmit } from "../completion/casingUtils.jsx";
import { getIsoDateIfDefined } from "./hydrogeologyFormUtils.ts";
import { hydrogeologySchemaConstants } from "./hydrogeologySchemaConstants";
import { GroundwaterLevelMeasurementInputProps, GwlmFormData, ObservationType } from "./Observation.ts";
import ObservationInput from "./observationInput.tsx";

const GroundwaterLevelMeasurementInput = ({ item, parentId }: GroundwaterLevelMeasurementInputProps) => {
  const prepareFormDataForSubmit = (data: GwlmFormData) => {
    data = prepareCasingDataForSubmit(data);
    data.startTime = getIsoDateIfDefined(data?.startTime);
    data.endTime = getIsoDateIfDefined(data?.endTime);
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
      <ObservationInput observation={item} showDepthInputs={false} />
      <FormContainer direction="row" sx={{ paddingTop: "10px" }}>
        <FormDomainSelect
          fieldName="kindId"
          label="gwlm_kind"
          selected={item.kindId}
          required={true}
          schemaName={hydrogeologySchemaConstants.groundwaterLevelMeasurementKind}
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
