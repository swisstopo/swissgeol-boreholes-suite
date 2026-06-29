import { deleteInstrumentation } from "../../../../api/fetchApiV2.ts";
import { Instrumentation } from "../../../../api/generated";
import { DataDisplayCard } from "../../../../components/dataCard/dataDisplayCard.tsx";
import { FormContainer, FormDisplay, FormValueType } from "../../../../components/form/form";
import { useGetCasingName } from "./casingUtils.tsx";
import { DataCardItemDisplayProps } from "./completionInterfaces.ts";

const InstrumentationDisplay = ({ item }: DataCardItemDisplayProps<Instrumentation>) => {
  const { getCasingNameWithCompletion } = useGetCasingName();

  return (
    <DataDisplayCard item={item} deleteData={deleteInstrumentation} entityName={"instrumentation"}>
      <FormContainer direction="row">
        <FormDisplay label="fromDepth" value={item?.fromDepth} type={FormValueType.Number} />
        <FormDisplay label="toDepth" value={item?.toDepth} type={FormValueType.Number} />
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
