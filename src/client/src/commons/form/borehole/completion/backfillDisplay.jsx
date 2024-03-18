import { StackFullWidth } from "../../../../components/baseComponents";
import { FormDisplay, FormDisplayType } from "../../../../components/form/form";
import DataDisplayCard from "../../../../components/dataCard/dataDisplayCard";
import { StackHalfWidth } from "../../../../components/baseComponents.js";
import { useGetCasingName } from "./casingUtils";
import { deleteBackfill } from "../../../../api/fetchApiV2";

const BackfillDisplay = props => {
  const { item, isEditable } = props;
  const getCasingName = useGetCasingName();

  return (
    <DataDisplayCard item={item} isEditable={isEditable} deleteData={deleteBackfill}>
      <StackFullWidth direction="row" spacing={1}>
        <FormDisplay label="fromdepth" value={item?.fromDepth} />
        <FormDisplay label="todepth" value={item?.toDepth} />
      </StackFullWidth>
      <StackFullWidth direction="row" spacing={1}>
        <FormDisplay label="kindBackfill" value={item?.kind} type={FormDisplayType.Domain} />
        <FormDisplay label="materialBackfill" value={item?.material} type={FormDisplayType.Domain} />
      </StackFullWidth>
      <StackHalfWidth>
        <FormDisplay label="casingName" value={getCasingName(item)} />
      </StackHalfWidth>
      <FormDisplay label="notes" value={item?.notes} />
    </DataDisplayCard>
  );
};

export default BackfillDisplay;
