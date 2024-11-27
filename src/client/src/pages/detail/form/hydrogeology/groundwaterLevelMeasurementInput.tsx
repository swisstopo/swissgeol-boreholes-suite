import { addGroundwaterLevelMeasurement, updateGroundwaterLevelMeasurement } from "../../../../api/fetchApiV2";
import DataInputCard from "../../../../components/dataCard/dataInputCard.jsx";
import { FormContainer, FormInput, FormValueType } from "../../../../components/form/form";
import { FormDomainSelect } from "../../../../components/form/formDomainSelect";
import { prepareCasingDataForSubmit } from "../completion/casingUtils.jsx";
import { hydrogeologySchemaConstants } from "./hydrogeologySchemaConstants";
import { GroundwaterLevelMeasurementInputProps, GwlmFormData } from "./Observation.ts";
import ObservationInput from "./observationInput.tsx";
import { ObservationType } from "./observationType";

const GroundwaterLevelMeasurementInput = ({ item, parentId }: GroundwaterLevelMeasurementInputProps) => {
  const prepareFormDataForSubmit = (data: GwlmFormData) => {
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
      <ObservationInput observation={item} boreholeId={parentId} showDepthInputs={false} />
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
