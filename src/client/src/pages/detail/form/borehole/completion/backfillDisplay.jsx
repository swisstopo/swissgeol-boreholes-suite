import { StackFullWidth, StackHalfWidth } from "../../../../../components/styledComponents.js";
import { FormDisplay, FormDisplayType } from "../../../../../components/form/form.js";
import DataDisplayCard from "../../../../../components/dataCard/dataDisplayCard.jsx";
import { useGetCasingName } from "./casingUtils.jsx";
import { deleteBackfill } from "../../../../../api/fetchApiV2.js";

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
        <FormDisplay label="kindBackfill" value={item?.kind} type={FormDisplayType.Domain} />
        <FormDisplay label="materialBackfill" value={item?.material} type={FormDisplayType.Domain} />
      </StackFullWidth>
      <StackHalfWidth>
        <FormDisplay label="casingName" value={getCasingNameWithCompletion(item)} />
      </StackHalfWidth>
      <FormDisplay label="notes" value={item?.notes} />
    </DataDisplayCard>
  );
};

export default BackfillDisplay;
