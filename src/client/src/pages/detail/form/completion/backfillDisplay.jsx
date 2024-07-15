import { StackFullWidth, StackHalfWidth } from "../../../../components/styledComponents.ts";
import { FormDisplay, FormValueType } from "../../../../components/form/form";
import DataDisplayCard from "../../../../components/dataCard/dataDisplayCard.jsx";
import { useGetCasingName } from "./casingUtils";
import { deleteBackfill } from "../../../../api/fetchApiV2";

const BackfillDisplay = props => {
  const { item, isEditable } = props;
  const { getCasingNameWithCompletion } = useGetCasingName();

  return (
    <DataDisplayCard item={item} isEditable={isEditable} deleteData={deleteBackfill}>
      <StackFullWidth direction="row" spacing={1}>
        <FormDisplay label="fromdepth" value={item?.fromDepth} />
        <FormDisplay label="todepth" value={item?.toDepth} />
      </StackFullWidth>
      <StackFullWidth direction="row" spacing={1}>
        <FormDisplay label="kindBackfill" value={item?.kind} type={FormValueType.Domain} />
        <FormDisplay label="materialBackfill" value={item?.material} type={FormValueType.Domain} />
      </StackFullWidth>
      <StackHalfWidth>
        <FormDisplay label="casingName" value={getCasingNameWithCompletion(item)} />
      </StackHalfWidth>
      <FormDisplay label="notes" value={item?.notes} />
    </DataDisplayCard>
  );
};

export default BackfillDisplay;
