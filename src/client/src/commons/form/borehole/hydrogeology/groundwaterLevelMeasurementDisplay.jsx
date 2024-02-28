import { StackFullWidth } from "../../../../components/baseComponents";
import { FormDisplay, FormDisplayType } from "../../../../components/form/form";
import DataDisplayCard from "../../../../components/dataCard/dataDisplayCard";
import ObservationDisplay from "./observationDisplay";

const GroundwaterLevelMeasurementDisplay = props => {
  const { item, selected, setSelected, isEditable, deleteData } = props;

  return (
    <DataDisplayCard
      item={item}
      selected={selected}
      setSelected={setSelected}
      isEditable={isEditable}
      deleteData={deleteData}>
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
