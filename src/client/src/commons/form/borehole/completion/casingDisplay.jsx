import { StackFullWidth } from "../../../../components/baseComponents";
import { FormDisplay } from "../../../../components/form/form";
import { FormDisplayType } from "../../../../components/form/FormDisplayType";
import DataDisplayCard from "../../../../components/dataCard/dataDisplayCard";

const CasingDisplay = props => {
  const { item, selected, setSelected, isEditable, deleteData } = props;

  return (
    <DataDisplayCard
      item={item}
      selected={selected}
      setSelected={setSelected}
      isEditable={isEditable}
      deleteData={deleteData}>
      <FormDisplay label="name" value={item?.name} />
      <StackFullWidth direction="row" spacing={1}>
        <FormDisplay label="fromdepth" value={item?.fromDepth} />
        <FormDisplay label="todepth" value={item?.toDepth} />
      </StackFullWidth>
      <StackFullWidth direction="row" spacing={1}>
        <FormDisplay label="kindCasingLayer" value={item?.kind} type={FormDisplayType.Domain} />
        <FormDisplay label="materialCasingLayer" value={item?.material} type={FormDisplayType.Domain} />
      </StackFullWidth>
      <StackFullWidth direction="row" spacing={1}>
        <FormDisplay label="dateStartCasing" value={item?.dateStart} type={FormDisplayType.Date} />
        <FormDisplay label="dateFinishCasing" value={item?.dateFinish} type={FormDisplayType.Date} />
      </StackFullWidth>
      <StackFullWidth direction="row" spacing={1}>
        <FormDisplay label="casingInnerDiameter" value={item?.innerDiameter} />
        <FormDisplay label="casingOuterDiameter" value={item?.outerDiameter} />
      </StackFullWidth>
      <FormDisplay label="notes" value={item?.notes} />
    </DataDisplayCard>
  );
};

export default CasingDisplay;
