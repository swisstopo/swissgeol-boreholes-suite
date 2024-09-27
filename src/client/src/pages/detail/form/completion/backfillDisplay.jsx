import { deleteBackfill } from "../../../../api/fetchApiV2";
import DataDisplayCard from "../../../../components/dataCard/dataDisplayCard.jsx";
import { FormContainer, FormDisplay, FormValueType } from "../../../../components/form/form";
import { useGetCasingName } from "./casingUtils";

const BackfillDisplay = props => {
  const { item, isEditable } = props;
  const { getCasingNameWithCompletion } = useGetCasingName();

  return (
    <DataDisplayCard item={item} isEditable={isEditable} deleteData={deleteBackfill}>
      <FormContainer direction="row">
        <FormDisplay label="fromdepth" value={item?.fromDepth} />
        <FormDisplay label="todepth" value={item?.toDepth} />
      </FormContainer>
      <FormContainer direction="row">
        <FormDisplay label="kindBackfill" value={item?.kind} type={FormValueType.Domain} />
        <FormDisplay label="materialBackfill" value={item?.material} type={FormValueType.Domain} />
      </FormContainer>
      <FormContainer>
        <FormDisplay label="casingName" value={getCasingNameWithCompletion(item)} />
      </FormContainer>
      <FormDisplay label="notes" value={item?.notes} />
    </DataDisplayCard>
  );
};

export default BackfillDisplay;
