import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDomains, getCasings } from "../../../../api/fetchApiV2";
import { completionSchemaConstants } from "./completionSchemaConstants";
import { FormInput, FormSelect } from "../../../../components/form/form";
import { DataInputCard } from "../../../../components/dataCard/dataInputCard";
import { StackFullWidth, StackHalfWidth } from "../../../../components/baseComponents.js";
import { getCasingOptions, prepareCasingDataForSubmit } from "./casingUtils";

const BackfillInput = ({ item, setSelected, parentId, addData, updateData }) => {
  const domains = useDomains();
  const { i18n } = useTranslation();
  const [casings, setCasings] = useState([]);

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
      setSelected={setSelected}
      addData={addData}
      updateData={updateData}
      prepareFormDataForSubmit={prepareFormDataForSubmit}>
      <StackFullWidth direction="row">
        <FormInput fieldName="fromDepth" label="fromdepth" value={item.fromDepth} type="number" required={true} />
        <FormInput fieldName="toDepth" label="todepth" value={item.toDepth} type="number" required={true} />
      </StackFullWidth>
      <StackFullWidth direction="row">
        <FormSelect
          fieldName="kindId"
          label="kindFilling"
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
          label="materialFilling"
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
      </StackFullWidth>
      <StackHalfWidth>
        <FormSelect
          fieldName="casingId"
          label="casingName"
          selected={item.isOpenBorehole ? -1 : item.casingId}
          values={getCasingOptions(casings)}
        />
      </StackHalfWidth>
      <StackFullWidth>
        <FormInput fieldName="notes" label="notes" multiline={true} value={item.notes} />
      </StackFullWidth>
    </DataInputCard>
  );
};

const MemoizedBackfillInput = React.memo(BackfillInput);
export default MemoizedBackfillInput;
