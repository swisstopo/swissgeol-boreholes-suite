import React, { useEffect, useState } from "react";
import { Stack } from "@mui/material";
import { useTranslation } from "react-i18next";
import { useDomains, getCasings, addInstrumentation, updateInstrumentation } from "../../../../api/fetchApiV2";
import { completionSchemaConstants } from "./completionSchemaConstants";
import { FormInput, FormSelect } from "../../../../components/form/form";
import { DataInputCard } from "../../../../components/dataCard/dataInputCard";
import { useGetCasingOptions, prepareCasingDataForSubmit } from "./casingUtils";

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
      prepareFormDataForSubmit={prepareFormDataForSubmit}>
      <Stack direction="row">
        <FormInput fieldName="fromDepth" label="fromdepth" value={item.fromDepth} type="number" required={true} />
        <FormInput fieldName="toDepth" label="todepth" value={item.toDepth} type="number" required={true} />
      </Stack>
      <Stack direction="row">
        <FormInput fieldName="name" label="name" value={item.name} required={true} />
        <FormSelect
          fieldName="casingId"
          label="casingName"
          selected={item.isOpenBorehole ? -1 : item.casingId}
          values={getCasingOptions(casings)}
        />
      </Stack>
      <Stack direction="row">
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
      </Stack>
      <Stack direction="row">
        <FormInput fieldName="notes" label="notes" multiline={true} value={item.notes} />
      </Stack>
    </DataInputCard>
  );
};

const MemoizedInstrumentationInput = React.memo(InstrumentationInput);
export default MemoizedInstrumentationInput;
