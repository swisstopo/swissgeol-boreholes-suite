import { StackFullWidth } from "../../../../components/styledComponents.js";
import { FormDisplay, FormDisplayType } from "../../../../components/form/form.js";
import DataDisplayCard from "../../../../components/dataCard/dataDisplayCard.jsx";
import { useGetCasingName } from "./casingUtils.jsx";
import { deleteInstrumentation } from "../../../../api/fetchApiV2.js";

const InstrumentationDisplay = props => {
  const { item, isEditable } = props;
  const { getCasingNameWithCompletion } = useGetCasingName();

  return (
    <DataDisplayCard item={item} isEditable={isEditable} deleteData={deleteInstrumentation}>
      <StackFullWidth direction="row" spacing={1}>
        <FormDisplay label="fromdepth" value={item?.fromDepth} />
        <FormDisplay label="todepth" value={item?.toDepth} />
      </StackFullWidth>
      <StackFullWidth direction="row" spacing={1}>
        <FormDisplay label="name" value={item?.name} />
        <FormDisplay label="casingName" value={getCasingNameWithCompletion(item)} />
      </StackFullWidth>
      <StackFullWidth direction="row" spacing={1}>
        <FormDisplay label="kindInstrument" value={item?.kind} type={FormDisplayType.Domain} />
        <FormDisplay label="statusInstrument" value={item?.status} type={FormDisplayType.Domain} />
      </StackFullWidth>
      <FormDisplay label="notes" value={item?.notes} />
    </DataDisplayCard>
  );
};

export default InstrumentationDisplay;
