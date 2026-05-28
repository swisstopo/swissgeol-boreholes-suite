import { useQuery } from "@tanstack/react-query";
import { DataInputCard } from "../../../../components/dataCard/dataInputCard.tsx";
import { FormContainer, FormInput, FormSelect, FormValueType } from "../../../../components/form/form";
import { FormDomainSelect } from "../../../../components/form/formDomainSelect";
import { prepareCasingDataForSubmit, useGetCasingOptions } from "./casingUtils.tsx";
import {
  addCompletionBackfill,
  BackfillData,
  DataCardItemInputProps,
  getCompletionCasings,
  updateCompletionBackfill,
} from "./completionInterfaces.ts";
import { completionSchemaConstants } from "./completionSchemaConstants.ts";
import { prepareEntityDataForSubmit } from "./completionUtils.ts";

const BackfillInput = ({ item, parentId }: DataCardItemInputProps<BackfillData>) => {
  const { data: casings = [] } = useQuery({
    queryKey: ["casings", parentId],
    queryFn: () => getCompletionCasings(parentId),
    enabled: !!parentId,
  });

  const getCasingOptions = useGetCasingOptions();
  const casingOptions = getCasingOptions(casings);

  const prepareFormDataForSubmit = (data: BackfillData): BackfillData => {
    data = prepareCasingDataForSubmit(data);
    data = prepareEntityDataForSubmit(data, parentId);
    return data;
  };

  if (!casingOptions) return null;
  return (
    <DataInputCard
      item={item}
      addData={addCompletionBackfill}
      updateData={updateCompletionBackfill}
      entityName="backfill"
      prepareFormDataForSubmit={prepareFormDataForSubmit}>
      <FormContainer direction="row">
        <FormInput
          fieldName="fromDepth"
          label="fromdepth"
          value={item.fromDepth}
          type={FormValueType.Number}
          required={true}
        />
        <FormInput
          fieldName="toDepth"
          label="todepth"
          value={item.toDepth}
          type={FormValueType.Number}
          required={true}
        />
      </FormContainer>
      <FormContainer direction="row">
        <FormDomainSelect
          fieldName="kindId"
          label="kindBackfill"
          selected={item.kindId}
          required={true}
          schemaName={completionSchemaConstants.backfillType}
        />
        <FormDomainSelect
          fieldName="materialId"
          label="materialBackfill"
          selected={item.materialId}
          required={true}
          schemaName={completionSchemaConstants.backfillMaterial}
        />
      </FormContainer>
      <FormContainer width={"50%"}>
        <FormSelect
          fieldName="casingId"
          label="casingName"
          selected={item.isOpenBorehole ? -1 : item.casingId}
          values={casingOptions}
        />
      </FormContainer>
      <FormContainer>
        <FormInput fieldName="notes" label="notes" multiline={true} value={item.notes} />
      </FormContainer>
    </DataInputCard>
  );
};

export default BackfillInput;
