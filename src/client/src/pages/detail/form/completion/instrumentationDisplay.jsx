import { deleteInstrumentation } from "../../../../api/fetchApiV2.js";
import DataDisplayCard from "../../../../components/dataCard/dataDisplayCard.jsx";
import { FormContainer, FormDisplay, FormValueType } from "../../../../components/form/form";
import { useGetCasingName } from "./casingUtils.jsx";

const InstrumentationDisplay = props => {
  const { item } = props;
  const { getCasingNameWithCompletion } = useGetCasingName();

  return (
    <DataDisplayCard item={item} deleteData={deleteInstrumentation}>
      <FormContainer direction="row">
        <FormDisplay label="fromdepth" value={item?.fromDepth} />
        <FormDisplay label="todepth" value={item?.toDepth} />
      </FormContainer>
      <FormContainer direction="row">
        <FormDisplay label="name" value={item?.name} />
        <FormDisplay label="casingName" value={getCasingNameWithCompletion(item)} />
      </FormContainer>
      <FormContainer direction="row">
        <FormDisplay label="kindInstrument" value={item?.kind} type={FormValueType.Domain} />
        <FormDisplay label="statusInstrument" value={item?.status} type={FormValueType.Domain} />
      </FormContainer>
      <FormDisplay label="notes" value={item?.notes} />
    </DataDisplayCard>
  );
};

export default InstrumentationDisplay;
