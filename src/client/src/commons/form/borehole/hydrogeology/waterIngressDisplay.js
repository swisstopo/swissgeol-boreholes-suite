import React from "react";
import { StackFullWidth } from "../../../../components/baseComponents";
import { FormDisplay, FormDisplayType } from "../../../../components/form/form";
import DataDisplayCard from "../../../../components/dataCard/dataDisplayCard";
import ObservationDisplay from "./observationDisplay";

const WaterIngressDisplay = props => {
  const { item, selected, setSelected, isEditable, deleteData } = props;

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
          label="quantity"
          value={item?.quantity}
          type={FormDisplayType.Domain}
        />
        <FormDisplay
          label="conditions"
          value={item?.conditions}
          type={FormDisplayType.Domain}
        />
      </StackFullWidth>
    </DataDisplayCard>
  );
};

export default WaterIngressDisplay;
