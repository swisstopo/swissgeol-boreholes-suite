import { StackFullWidth } from "../../../../components/baseComponents";
import { FormDisplay, FormDisplayType } from "../../../../components/form/form";
import DataDisplayCard from "../../../../components/dataCard/dataDisplayCard";
import { StackHalfWidth } from "../../../../components/baseComponents.js";
import { getCasingName } from "./casingUtils";

const BackfillDisplay = props => {
  const { item, selected, setSelected, isEditable, deleteData } = props;

  return (
    <DataDisplayCard
      item={item}
      selected={selected}
      setSelected={setSelected}
      isEditable={isEditable}
      deleteData={deleteData}>
      <StackFullWidth direction="row" spacing={1}>
        <FormDisplay label="fromdepth" value={item?.fromDepth} />
        <FormDisplay label="todepth" value={item?.toDepth} />
      </StackFullWidth>
      <StackFullWidth direction="row" spacing={1}>
        <FormDisplay label="kindFilling" value={item?.kind} type={FormDisplayType.Domain} />
        <FormDisplay label="materialFilling" value={item?.material} type={FormDisplayType.Domain} />
      </StackFullWidth>
      <StackHalfWidth>
        <FormDisplay label="casingName" value={getCasingName(item)} />
      </StackHalfWidth>
      <FormDisplay label="notes" value={item?.notes} />
    </DataDisplayCard>
  );
};

export default BackfillDisplay;
