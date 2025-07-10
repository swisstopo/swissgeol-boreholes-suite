import { FC } from "react";
import DataInputCard from "../../../../../components/dataCard/dataInputCard.js";
import { FormContainer } from "../../../../../components/form/form.ts";
import { FormDomainSelect } from "../../../../../components/form/formDomainSelect.tsx";
import { parseFloatWithThousandsSeparator } from "../../../../../components/form/formUtils.ts";
import { prepareCasingDataForSubmit } from "../../completion/casingUtils.jsx";
import DepthInput from "../depthInput.tsx";
import { hydrogeologySchemaConstants } from "../hydrogeologySchemaConstants.ts";
import { ObservationType, prepareObservationDataForSubmit } from "../Observation.ts";
import ObservationInput from "../observationInput.tsx";
import {
  addGroundwaterLevelMeasurement,
  GroundwaterLevelMeasurement,
  updateGroundwaterLevelMeasurement,
} from "./GroundwaterLevelMeasurement.ts";

const GroundwaterLevelMeasurementInput: FC<{ item: GroundwaterLevelMeasurement; parentId: number }> = ({
  item,
  parentId,
}) => {
  const prepareFormDataForSubmit = (data: GroundwaterLevelMeasurement) => {
    data = prepareCasingDataForSubmit(data);
    data = prepareObservationDataForSubmit(data, parentId);
    data.type = ObservationType.groundwaterLevelMeasurement;
    data.levelM = parseFloatWithThousandsSeparator(data.levelM);
    data.levelMasl = parseFloatWithThousandsSeparator(data.levelMasl);

    if (data.casingId == null) {
      data.casingId = item.casingId;
    }

    return data;
  };

  return (
    <DataInputCard
      item={item}
      addData={addGroundwaterLevelMeasurement}
      updateData={updateGroundwaterLevelMeasurement}
      entityName="groundwaterLevelMeasurement"
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
      <DepthInput
        observation={item}
        depthFields={[
          {
            fieldNameMD: "levelM",
            labelMD: "gwlm_levelm",
            getValueMD: () => item.levelM,
            fieldNameMasl: "levelMasl",
            labelMasl: "gwlm_levelmasl",
            getValueMasl: () => item.levelMasl,
          },
        ]}
      />
    </DataInputCard>
  );
};

export default GroundwaterLevelMeasurementInput;
