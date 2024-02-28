import React from "react";
import { Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useDomains } from "../../../../api/fetchApiV2";
import { completionSchemaConstants } from "./completionSchemaConstants";
import { FormInput, FormSelect } from "../../../../components/form/form";
import { DataInputCard } from "../../../../components/dataCard/dataInputCard";

const BackfillInput = ({ item, setSelected, parentId, addData, updateData }) => {
  const domains = useDomains();
  const { i18n } = useTranslation();

  const prepareFormDataForSubmit = data => {
    data.completionId = parentId;
    return data;
  };

  return (
    <DataInputCard
      item={item}
      setSelected={setSelected}
      addData={addData}
      updateData={updateData}
      prepareFormDataForSubmit={prepareFormDataForSubmit}>
      <Stack direction="row">
        <FormInput fieldName="fromDepth" label="fromdepth" value={item.fromDepth} type="number" required={true} />
        <FormInput fieldName="toDepth" label="todepth" value={item.toDepth} type="number" required={true} />
      </Stack>
      <Stack direction="row">
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
      </Stack>
      <Stack direction="row">
        <FormInput fieldName="notes" label="notes" multiline={true} value={item.notes} />
      </Stack>
    </DataInputCard>
  );
};

const MemoizedBackfillInput = React.memo(BackfillInput);
export default MemoizedBackfillInput;
