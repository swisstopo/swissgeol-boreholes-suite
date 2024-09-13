import { FormDisplay, FormValueType } from "../../../../components/form/form";
import ObservationDisplay from "./observationDisplay";
import DataDisplayCard from "../../../../components/dataCard/dataDisplayCard.jsx";
import { deleteGroundwaterLevelMeasurement } from "../../../../api/fetchApiV2.js";
import { StackFullWidth } from "../../../../components/styledComponents.ts";

const GroundwaterLevelMeasurementDisplay = props => {
  const { item, isEditable } = props;

  return (
    <DataDisplayCard item={item} isEditable={isEditable} deleteData={deleteGroundwaterLevelMeasurement}>
      <ObservationDisplay observation={item} />
      <StackFullWidth direction="row" spacing={1}>
        <FormDisplay label="gwlm_kind" value={item?.kind} type={FormValueType.Domain} />
      </StackFullWidth>
      <StackFullWidth direction="row" spacing={1}>
        <FormDisplay label="gwlm_levelmasl" value={item?.levelMasl} />
        <FormDisplay label="gwlm_levelm" value={item?.levelM} />
      </StackFullWidth>
    </DataDisplayCard>
  );
};

export default GroundwaterLevelMeasurementDisplay;
