import React from "react";
import { StackFullWidth } from "../../../../components/baseComponents";
import { FormDisplay, FormDisplayType } from "../../../../components/form/form";
import DataDisplayCard from "../../../../components/dataCard/dataDisplayCard";
import ObservationDisplay from "./observationDisplay";
import { FieldMeasurementParameterUnits } from "./parameterUnits";
import { useDomains } from "../../../../api/fetchApiV2";

const FieldMeasurementDisplay = props => {
  const { item, selected, setSelected, isEditable, deleteData } = props;
  const domains = useDomains();

  const getParameterUnit = parameterId => {
    return FieldMeasurementParameterUnits[
      domains.data?.find(d => d.id === parameterId)?.geolcode
    ];
  };

  return (
    <DataDisplayCard
      item={item}
      selected={selected}
      setSelected={setSelected}
      isEditable={isEditable}
      deleteData={deleteData}>
      <ObservationDisplay observation={item} />
      <StackFullWidth direction="row" spacing={1}>
        <FormDisplay
          label="field_measurement_sample_type"
          value={item?.sampleType}
          type={FormDisplayType.Domain}
        />
        <FormDisplay
          label="parameter"
          value={item?.parameter}
          type={FormDisplayType.Domain}
        />
      </StackFullWidth>
      <StackFullWidth direction="row" spacing={1}>
        <FormDisplay
          label="value"
          value={
            item?.value && (
              <>
                <span>{item?.value + " "}</span>
                {getParameterUnit(item.parameterId)}
              </>
            )
          }
        />
      </StackFullWidth>
    </DataDisplayCard>
  );
};

export default FieldMeasurementDisplay;
