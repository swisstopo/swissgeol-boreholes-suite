import React from "react";
import { Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useDomains } from "../../../../api/fetchApiV2";
import { completionSchemaConstants } from "./completionSchemaConstants";
import { FormInput, FormSelect } from "../../../../components/form/form";
import { DataInputCard } from "../../../../components/dataCard/dataInputCard";

const CasingInput = ({ item, setSelected, parentId, addData, updateData }) => {
  const domains = useDomains();
  const { i18n } = useTranslation();

  const prepareFormDataForSubmit = data => {
    if (data?.dateStart === "") {
      data.dateStart = null;
    }
    if (data?.dateFinish === "") {
      data.dateFinish = null;
    }
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
      <FormInput
        fieldName="name"
        label="casingName"
        value={item.name}
        required={true}
      />
      <Stack direction="row">
        <FormInput
          fieldName="fromDepth"
          label="fromdepth"
          value={item.fromDepth}
          type="number"
          required={true}
        />
        <FormInput
          fieldName="toDepth"
          label="todepth"
          value={item.toDepth}
          type="number"
          required={true}
        />
      </Stack>
      <Stack direction="row">
        <FormSelect
          fieldName="kindId"
          label="kindCasingLayer"
          selected={item.kindId}
          required={true}
          values={domains?.data
            ?.filter(d => d.schema === completionSchemaConstants.casingKind)
            .sort((a, b) => a.order - b.order)
            .map(d => ({
              key: d.id,
              name: d[i18n.language],
            }))}
        />
        <FormSelect
          fieldName="materialId"
          label="materialCasingLayer"
          selected={item.materialId}
          required={true}
          values={domains?.data
            ?.filter(d => d.schema === completionSchemaConstants.casingMaterial)
            .sort((a, b) => a.order - b.order)
            .map(d => ({
              key: d.id,
              name: d[i18n.language],
            }))}
        />
      </Stack>
      <Stack direction="row">
        <FormInput
          fieldName="dateStart"
          label="dateStartCasing"
          value={item.dateStart}
          type="date"
          required={true}
        />
        <FormInput
          fieldName="dateFinish"
          label="dateFinishCasing"
          value={item.dateFinish}
          type="date"
          required={true}
        />
      </Stack>
      <Stack direction="row">
        <FormInput
          fieldName="innerDiameter"
          label="casingInnerDiameter"
          value={item.innerDiameter}
          type="number"
          required={true}
        />
        <FormInput
          fieldName="outerDiameter"
          label="casingOuterDiameter"
          value={item.outerDiameter}
          type="number"
          required={true}
        />
      </Stack>
      <Stack direction="row">
        <FormInput
          fieldName="notes"
          label="notes"
          multiline={true}
          value={item.notes}
        />
      </Stack>
    </DataInputCard>
  );
};

export default React.memo(CasingInput);
