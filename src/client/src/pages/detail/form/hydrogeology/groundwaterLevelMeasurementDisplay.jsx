import { deleteGroundwaterLevelMeasurement } from "../../../../api/fetchApiV2.js";
import DataDisplayCard from "../../../../components/dataCard/dataDisplayCard.jsx";
import { FormContainer, FormDisplay, FormValueType } from "../../../../components/form/form";
import ObservationDisplay from "./observationDisplay";

const GroundwaterLevelMeasurementDisplay = props => {
  const { item, isEditable } = props;

  return (
    <DataDisplayCard item={item} isEditable={isEditable} deleteData={deleteGroundwaterLevelMeasurement}>
      <ObservationDisplay observation={item} />
      <FormContainer direction="row">
        <FormDisplay label="gwlm_kind" value={item?.kind} type={FormValueType.Domain} />
      </FormContainer>
      <FormContainer direction="row">
        <FormDisplay label="gwlm_levelmasl" value={item?.levelMasl} />
        <FormDisplay label="gwlm_levelm" value={item?.levelM} />
      </FormContainer>
    </DataDisplayCard>
  );
};

export default GroundwaterLevelMeasurementDisplay;
