import React from "react";
import { StackFullWidth } from "../../../../components/baseComponents";
import { FormDisplay, FormDisplayType } from "../../../../components/form/form";
import DataDisplayCard from "../../../../components/dataCard/dataDisplayCard";

const InstrumentationDisplay = props => {
  const { item, selected, setSelected, isEditable, deleteData } = props;

  return (
    <DataDisplayCard
      item={item}
      selected={selected}
      setSelected={setSelected}
      isEditable={isEditable}
      deleteData={deleteData}>
      <StackFullWidth direction="row" spacing={1}>
        <FormDisplay label="fromdepth" value={item?.fromDepth} />
        <FormDisplay label="todepth" value={item?.toDepth} />
      </StackFullWidth>
      <StackFullWidth direction="row" spacing={1}>
        <FormDisplay label="name" value={item?.name} />
        <FormDisplay
          label="casingName"
          value={item?.casingId ? item?.casing?.name : null}
        />
      </StackFullWidth>
      <StackFullWidth direction="row" spacing={1}>
        <FormDisplay
          label="kindInstrument"
          value={item?.kind}
          type={FormDisplayType.Domain}
        />
        <FormDisplay
          label="statusInstrument"
          value={item?.status}
          type={FormDisplayType.Domain}
        />
      </StackFullWidth>
      <FormDisplay label="notes" value={item?.notes} />
    </DataDisplayCard>
  );
};

export default InstrumentationDisplay;
