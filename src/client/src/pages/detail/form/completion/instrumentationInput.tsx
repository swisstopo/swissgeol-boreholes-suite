import { useEffect, useState } from "react";
import { addInstrumentation, getCasings, updateInstrumentation } from "../../../../api/fetchApiV2.ts";
import { Casing, Instrumentation } from "../../../../api/generated";
import { DataInputCard } from "../../../../components/dataCard/dataInputCard.tsx";
import { FormContainer, FormInput, FormSelect, FormValueType } from "../../../../components/form/form";
import { FormDomainSelect } from "../../../../components/form/formDomainSelect";
import { prepareCasingDataForSubmit, useGetCasingOptions } from "./casingUtils.tsx";
import { DataCardItemInputProps } from "./completionInterfaces.ts";
import { completionSchemaConstants } from "./completionSchemaConstants.ts";
import { prepareEntityDataForSubmit } from "./completionUtils.ts";

const InstrumentationInput = ({ item, parentId }: DataCardItemInputProps<Instrumentation>) => {
  const [casings, setCasings] = useState<Casing[]>([]);
  const getCasingOptions = useGetCasingOptions();

  const prepareFormDataForSubmit = (data: Instrumentation): Instrumentation => {
    data = prepareCasingDataForSubmit(data);
    data = prepareEntityDataForSubmit(data, parentId);
    return data;
  };

  useEffect(() => {
    if (parentId) {
      getCasings(parentId).then(casings => {
        setCasings(casings);
      });
    }
  }, [parentId]);

  return (
    <DataInputCard<Instrumentation>
      item={item}
      addData={addInstrumentation}
      updateData={updateInstrumentation}
      entityName="instrumentation"
      prepareFormDataForSubmit={prepareFormDataForSubmit}>
      <FormContainer direction="row">
        <FormInput
          fieldName="fromDepth"
          label="fromDepth"
          value={item.fromDepth}
          type={FormValueType.Number}
          required={true}
        />
        <FormInput
          fieldName="toDepth"
          label="toDepth"
          value={item.toDepth}
          type={FormValueType.Number}
          required={true}
        />
      </FormContainer>
      <FormContainer direction="row">
        <FormInput fieldName="name" label="name" value={item.name} required={true} />
        <FormSelect
          fieldName="casingId"
          label="casingName"
          selected={item.isOpenBorehole ? -1 : item.casingId}
          values={getCasingOptions(casings)}
        />
      </FormContainer>
      <FormContainer direction="row">
        <FormDomainSelect
          fieldName="kindId"
          label="kindInstrument"
          selected={item.kindId}
          required={true}
          schemaName={completionSchemaConstants.instrumentationType}
        />
        <FormDomainSelect
          fieldName="statusId"
          label="statusInstrument"
          selected={item.statusId}
          required={true}
          schemaName={completionSchemaConstants.instrumentationStatus}
        />
      </FormContainer>
      <FormContainer direction="row">
        <FormInput fieldName="notes" label="notes" multiline={true} value={item.notes} />
      </FormContainer>
    </DataInputCard>
  );
};

export default InstrumentationInput;
