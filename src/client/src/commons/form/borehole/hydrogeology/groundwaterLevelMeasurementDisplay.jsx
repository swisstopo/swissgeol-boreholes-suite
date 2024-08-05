import { StackFullWidth } from "../../../../components/styledComponents";
import { FormDisplay, FormDisplayType } from "../../../../components/form/form";
import DataDisplayCard from "../../../../components/dataCard/dataDisplayCard";
import ObservationDisplay from "./observationDisplay";
import { deleteGroundwaterLevelMeasurement } from "../../../../api/fetchApiV2";

const GroundwaterLevelMeasurementDisplay = props => {
  const { item, isEditable } = props;

  return (
    <DataDisplayCard item={item} isEditable={isEditable} deleteData={deleteGroundwaterLevelMeasurement}>
      <ObservationDisplay observation={item} />
      <StackFullWidth direction="row" spacing={1}>
        <FormDisplay label="gwlm_kind" value={item?.kind} type={FormDisplayType.Domain} />
      </StackFullWidth>
      <StackFullWidth direction="row" spacing={1}>
        <FormDisplay label="gwlm_levelm" value={item?.levelM} />
        <FormDisplay label="gwlm_levelmasl" value={item?.levelMasl} />
      </StackFullWidth>
    </DataDisplayCard>
  );
};

export default GroundwaterLevelMeasurementDisplay;
