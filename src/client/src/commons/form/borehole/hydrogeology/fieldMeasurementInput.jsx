import { useState } from "react";
import { InputAdornment, Stack } from "@mui/material";
import { FormInput, FormSelect } from "../../../../components/form/form";
import { DataInputCard } from "../../../../components/dataCard/dataInputCard";
import { addFieldMeasurement, updateFieldMeasurement, useDomains } from "../../../../api/fetchApiV2";
import { useTranslation } from "react-i18next";
import ObservationInput from "./observationInput";
import { ObservationType } from "./observationType";
import { hydrogeologySchemaConstants } from "./hydrogeologySchemaConstants";
import { FieldMeasurementParameterUnits } from "./parameterUnits";

const FieldMeasurementInput = props => {
  const { item, parentId } = props;
  const domains = useDomains();
  const { i18n } = useTranslation();
  const [parameterId, setParameterId] = useState(null);

  const prepareFormDataForSubmit = data => {
    data?.startTime ? (data.startTime += ":00.000Z") : (data.startTime = null);
    data?.endTime ? (data.endTime += ":00.000Z") : (data.endTime = null);
    data.type = ObservationType.fieldMeasurement;
    data.boreholeId = parentId;
    if (data.casingId == null) {
      data.casingId = item.casingId;
    }
    data.casing = null;
    return data;
  };

  const getParameterUnit = parameterId => {
    return FieldMeasurementParameterUnits[domains.data?.find(d => d.id === parameterId)?.geolcode];
  };

  return (
    <DataInputCard
      item={item}
      addData={addFieldMeasurement}
      updateData={updateFieldMeasurement}
      promptLabel="field_measurement"
      prepareFormDataForSubmit={prepareFormDataForSubmit}>
      <ObservationInput observation={item} boreholeId={parentId} />
      <Stack direction="row" sx={{ paddingTop: "10px" }}>
        <FormSelect
          fieldName="sampleTypeId"
          label="field_measurement_sample_type"
          selected={item.sampleTypeId}
          required={true}
          values={domains?.data
            ?.filter(d => d.schema === hydrogeologySchemaConstants.fieldMeasurementSampleType)
            .sort((a, b) => a.order - b.order)
            .map(d => ({
              key: d.id,
              name: d[i18n.language],
            }))}
        />
        <FormSelect
          fieldName="parameterId"
          label="parameter"
          selected={item.parameterId}
          required={true}
          values={domains?.data
            ?.filter(d => d.schema === hydrogeologySchemaConstants.fieldMeasurementParameter)
            .sort((a, b) => a.order - b.order)
            .map(d => ({
              key: d.id,
              name: d[i18n.language],
            }))}
          onUpdate={value => {
            setParameterId(value);
          }}
        />
      </Stack>
      <Stack direction="row">
        <FormInput
          fieldName="value"
          label="value"
          value={item.value}
          type="number"
          required={true}
          inputProps={{
            endAdornment: (
              <InputAdornment position="end">{parameterId && getParameterUnit(parameterId)}</InputAdornment>
            ),
          }}
        />
      </Stack>
    </DataInputCard>
  );
};

export default FieldMeasurementInput;
