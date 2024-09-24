import { useEffect, useState } from "react";
import { addInstrumentation, getCasings, updateInstrumentation } from "../../../../api/fetchApiV2.js";
import { completionSchemaConstants } from "./completionSchemaConstants.js";
import { FormContainer, FormInput, FormSelect, FormValueType } from "../../../../components/form/form";
import { DataInputCard } from "../../../../components/dataCard/dataInputCard.jsx";
import { prepareCasingDataForSubmit, useGetCasingOptions } from "./casingUtils.jsx";
import { FormDomainSelect } from "../../../../components/form/formDomainSelect";

const InstrumentationInput = ({ item, parentId }) => {
  const [casings, setCasings] = useState([]);
  const getCasingOptions = useGetCasingOptions();

  const prepareFormDataForSubmit = data => {
    data = prepareCasingDataForSubmit(data);
    data.completionId = parentId;
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
    <DataInputCard
      item={item}
      addData={addInstrumentation}
      updateData={updateInstrumentation}
      promptLabel="instrument"
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
