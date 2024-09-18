import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { addBackfill, getCasings, updateBackfill, useDomains } from "../../../../api/fetchApiV2";
import { completionSchemaConstants } from "./completionSchemaConstants";
import { FormContainer, FormInput, FormSelect, FormValueType } from "../../../../components/form/form";
import { DataInputCard } from "../../../../components/dataCard/dataInputCard";
import { prepareCasingDataForSubmit, useGetCasingOptions } from "./casingUtils";

const BackfillInput = ({ item, parentId }) => {
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
      addData={addBackfill}
      updateData={updateBackfill}
      promptLabel="backfill"
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
        <FormSelect
          fieldName="kindId"
          label="kindBackfill"
          selected={item.kindId}
          required={true}
          values={domains?.data
            ?.filter(d => d.schema === completionSchemaConstants.backfillType)
            .sort((a, b) => a.order - b.order)
            .map(d => ({
              key: d.id,
              name: d[i18n.language],
            }))}
        />
        <FormSelect
          fieldName="materialId"
          label="materialBackfill"
          selected={item.materialId}
          required={true}
          values={domains?.data
            ?.filter(d => d.schema === completionSchemaConstants.backfillMaterial)
            .sort((a, b) => a.order - b.order)
            .map(d => ({
              key: d.id,
              name: d[i18n.language],
            }))}
        />
      </FormContainer>
      <FormContainer width={"50%"}>
        <FormSelect
          fieldName="casingId"
          label="casingName"
          selected={item.isOpenBorehole ? -1 : item.casingId}
          values={getCasingOptions(casings)}
        />
      </FormContainer>
      <FormContainer>
        <FormInput fieldName="notes" label="notes" multiline={true} value={item.notes} />
      </FormContainer>
    </DataInputCard>
  );
};

export default BackfillInput;
