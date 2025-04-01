import { useEffect, useState } from "react";
import { addBackfill, getCasings, updateBackfill } from "../../../../api/fetchApiV2.js";
import { DataInputCard } from "../../../../components/dataCard/dataInputCard.tsx";
import { FormContainer, FormInput, FormSelect } from "../../../../components/form/form";
import { FormDomainSelect } from "../../../../components/form/formDomainSelect";
import { parseFloatWithThousandsSeparator } from "../../../../components/form/formUtils.js";
import { prepareCasingDataForSubmit, useGetCasingOptions } from "./casingUtils";
import { completionSchemaConstants } from "./completionSchemaConstants";

const BackfillInput = ({ item, parentId }) => {
  const [casings, setCasings] = useState([]);
  const getCasingOptions = useGetCasingOptions();

  const prepareFormDataForSubmit = data => {
    data = prepareCasingDataForSubmit(data);
    data.fromDepth = parseFloatWithThousandsSeparator(data.fromDepth);
    data.toDepth = parseFloatWithThousandsSeparator(data.toDepth);
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
          withThousandSeparator={true}
          required={true}
        />
        <FormInput
          fieldName="toDepth"
          label="todepth"
          value={item.toDepth}
          withThousandSeparator={true}
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
