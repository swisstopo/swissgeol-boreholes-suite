import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { addInstrumentation, getCasings, updateInstrumentation, useDomains } from "../../../../api/fetchApiV2.js";
import { DataInputCard } from "../../../../components/dataCard/dataInputCard.jsx";
import { FormContainer, FormInput, FormSelect, FormValueType } from "../../../../components/form/form";
import { prepareCasingDataForSubmit, useGetCasingOptions } from "./casingUtils.jsx";
import { completionSchemaConstants } from "./completionSchemaConstants.js";

const InstrumentationInput = ({ item, parentId }) => {
  const domains = useDomains();
  const { i18n } = useTranslation();
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
        <FormSelect
          fieldName="kindId"
          label="kindInstrument"
          selected={item.kindId}
          required={true}
          values={domains?.data
            ?.filter(d => d.schema === completionSchemaConstants.instrumentationType)
            .sort((a, b) => a.order - b.order)
            .map(d => ({
              key: d.id,
              name: d[i18n.language],
            }))}
        />
        <FormSelect
          fieldName="statusId"
          label="statusInstrument"
          selected={item.statusId}
          required={true}
          values={domains?.data
            ?.filter(d => d.schema === completionSchemaConstants.instrumentationStatus)
            .sort((a, b) => a.order - b.order)
            .map(d => ({
              key: d.id,
              name: d[i18n.language],
            }))}
        />
      </FormContainer>
      <FormContainer direction="row">
        <FormInput fieldName="notes" label="notes" multiline={true} value={item.notes} />
      </FormContainer>
    </DataInputCard>
  );
};

export default InstrumentationInput;
